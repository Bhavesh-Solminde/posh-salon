import { prisma } from "@/lib/db";
import { round2 } from "@/lib/money";

// The bill register: every invoice of one calendar month, split into the GST
// series and the non-GST series, each numbered 1…n in the order it was issued.
// The register number is positional (it is not the invoice number), so it is
// computed over the whole month before any search narrows the list — bill 7
// stays bill 7 whatever the cashier types into the search box.

export type RegisterView = "gst" | "non-gst";

const TZ_OFFSET = "+05:30"; // Asia/Kolkata — the salon's books close on IST midnight

const METHOD_LABEL: Record<string, string> = { CASH: "Cash", UPI: "UPI", CARD: "Card" };

export function parseView(v: string | undefined): RegisterView {
  return v === "non-gst" ? "non-gst" : "gst";
}

/** "2026-09" for the current month in IST. */
export function currentMonth(now = new Date()): string {
  const ist = new Date(now.getTime() + 330 * 60_000);
  return ist.toISOString().slice(0, 7);
}

/** Accepts "YYYY-MM"; anything else falls back to the current month. */
export function parseMonth(v: string | undefined): string {
  return v && /^\d{4}-(0[1-9]|1[0-2])$/.test(v) ? v : currentMonth();
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function monthRange(month: string) {
  return {
    gte: new Date(`${month}-01T00:00:00${TZ_OFFSET}`),
    lt: new Date(`${shiftMonth(month, 1)}-01T00:00:00${TZ_OFFSET}`),
  };
}

export async function countBills(month: string) {
  const groups = await prisma.invoice.groupBy({
    by: ["gstApplied"],
    where: { deletedAt: null, createdAt: monthRange(month) },
    _count: { _all: true },
  });
  const count = (gst: boolean) => groups.find((g) => g.gstApplied === gst)?._count._all ?? 0;
  return { gst: count(true), nonGst: count(false) };
}

export async function loadRegister(month: string, view: RegisterView, q?: string) {
  const invoices = await prisma.invoice.findMany({
    where: { deletedAt: null, gstApplied: view === "gst", createdAt: monthRange(month) },
    orderBy: { createdAt: "asc" },
    include: {
      customer: { select: { name: true, phone: true } },
      items: { select: { type: true, lineTotal: true } },
      payments: { select: { method: true } },
    },
  });

  const rows = invoices.map((inv, i) => {
    const total = Number(inv.grandTotal);
    const tax = Number(inv.taxTotal);
    // A membership top-up rides on the bill but is not a taxable supply, so it
    // is carved out of the taxable value (exact for inclusive and exclusive pricing).
    const topup = inv.items
      .filter((it) => it.type === "MEMBERSHIP_TOPUP")
      .reduce((s, it) => s + Number(it.lineTotal), 0);
    // Single-branch salon: every sale is intra-state, so GST splits evenly
    // into CGST + SGST. The odd paisa goes to SGST so the halves always add up.
    const cgst = round2(tax / 2);
    const methods = [...new Set(inv.payments.map((p) => p.method))];
    return {
      serial: i + 1,
      id: inv.id,
      number: inv.number,
      date: inv.createdAt,
      customer: inv.customer?.name ?? null,
      phone: inv.customer?.phone ?? null,
      itemCount: inv.items.length,
      taxable: round2(total - tax - topup),
      topup: round2(topup),
      cgst,
      sgst: round2(tax - cgst),
      tax,
      total,
      paid: Number(inv.amountPaid),
      wallet: Number(inv.walletRedeemed),
      due: Number(inv.balanceDue),
      method:
        methods.length === 0
          ? inv.walletRedeemed.gt(0)
            ? "Wallet"
            : null
          : methods.length > 1
            ? "Mixed"
            : (METHOD_LABEL[methods[0]] ?? methods[0]),
      status: inv.status,
    };
  });

  const needle = q?.trim().toLowerCase();
  const shown = needle
    ? rows.filter((r) =>
        [r.number, r.customer ?? "", r.phone ?? ""].some((v) => v.toLowerCase().includes(needle)),
      )
    : rows;

  return { rows: shown, monthCount: rows.length };
}

export type RegisterRow = Awaited<ReturnType<typeof loadRegister>>["rows"][number];

/** Void bills keep their register number but never count toward the totals. */
export function registerTotals(rows: RegisterRow[]) {
  const live = rows.filter((r) => r.status !== "VOID");
  const sum = (k: "taxable" | "cgst" | "sgst" | "tax" | "total" | "paid" | "due") =>
    round2(live.reduce((s, r) => s + r[k], 0));
  return {
    count: live.length,
    voided: rows.length - live.length,
    taxable: sum("taxable"),
    cgst: sum("cgst"),
    sgst: sum("sgst"),
    tax: sum("tax"),
    total: sum("total"),
    paid: sum("paid"),
    due: sum("due"),
  };
}
