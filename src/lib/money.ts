// Pure money helpers — no DB/Prisma imports, so they're unit-testable in isolation.
// All amounts are rupees; internal math is done in integer paise to avoid float drift.

const toPaise = (rupees: number) => Math.round(rupees * 100);
const toRupees = (paise: number) => paise / 100;

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export type LineType = "SERVICE" | "PRODUCT" | "MEMBERSHIP_TOPUP";

export type BillLine = {
  type: LineType;
  unitPrice: number;
  quantity: number;
  discount?: number; // absolute rupees off this line
};

export type InvoiceTotals = {
  serviceSubtotal: number; // post-line-discount service amount (pre-tax)
  productSubtotal: number;
  topupSubtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
};

/** Deterministic invoice math. GST applies to services + products, never to a
 *  membership top-up (a wallet load is not a taxable supply at load time). */
export function computeInvoiceTotals(
  lines: BillLine[],
  opts: { gstRatePct: number; pricesIncludeGst: boolean },
): InvoiceTotals {
  let servicePaise = 0;
  let productPaise = 0;
  let topupPaise = 0;
  let discountPaise = 0;

  for (const l of lines) {
    const gross = toPaise(l.unitPrice) * l.quantity;
    const disc = Math.min(toPaise(l.discount ?? 0), gross);
    const net = gross - disc;
    discountPaise += disc;
    if (l.type === "SERVICE") servicePaise += net;
    else if (l.type === "PRODUCT") productPaise += net;
    else topupPaise += net;
  }

  const taxableBase = servicePaise + productPaise;
  const rate = opts.gstRatePct / 100;

  let taxPaise: number;
  let grandPaise: number;
  if (opts.pricesIncludeGst) {
    // Prices already include GST — extract the tax component for the record.
    taxPaise = Math.round(taxableBase - taxableBase / (1 + rate));
    grandPaise = taxableBase + topupPaise;
  } else {
    taxPaise = Math.round(taxableBase * rate);
    grandPaise = taxableBase + taxPaise + topupPaise;
  }

  return {
    serviceSubtotal: toRupees(servicePaise),
    productSubtotal: toRupees(productPaise),
    topupSubtotal: toRupees(topupPaise),
    discountTotal: toRupees(discountPaise),
    taxTotal: toRupees(taxPaise),
    grandTotal: toRupees(grandPaise),
  };
}

/**
 * THE core rule: the membership wallet can only settle the SERVICE portion of a
 * bill, never products or the top-up. The redeemable amount is capped to the
 * (post-discount) service subtotal AND the available wallet balance.
 */
export function capWalletRedemption(
  requested: number,
  serviceSubtotal: number,
  walletBalance: number,
): number {
  const capped = Math.min(
    toPaise(Math.max(0, requested)),
    toPaise(Math.max(0, serviceSubtotal)),
    toPaise(Math.max(0, walletBalance)),
  );
  return toRupees(capped);
}

/** Indian financial year label for a date, e.g. 2026-05-xx → "26-27". */
export function financialYear(date: Date): string {
  const y = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? y : y - 1; // FY starts April (month 3)
  const a = String(startYear).slice(-2);
  const b = String(startYear + 1).slice(-2);
  return `${a}-${b}`;
}

/** e.g. ("POSH", 1, date) → "POSH/26-27/00001". */
export function formatInvoiceNumber(prefix: string, seq: number, date: Date): string {
  return `${prefix}/${financialYear(date)}/${String(seq).padStart(5, "0")}`;
}
