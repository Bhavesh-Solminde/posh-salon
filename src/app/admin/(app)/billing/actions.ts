"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { PaymentMethod } from "@prisma/client";
import { prisma, TX_OPTS } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { withErrorLogging } from "@/lib/actions";
import {
  computeInvoiceTotals,
  capWalletRedemption,
  formatInvoiceNumber,
  round2,
} from "@/lib/money";

const lineSchema = z.object({
  type: z.enum(["SERVICE", "PRODUCT"]),
  refId: z.string().nullable().optional(),
  name: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  employeeId: z.string().nullable().optional(),
});

const payloadSchema = z.object({
  customerId: z.string().nullable().optional(),
  lines: z.array(lineSchema).min(1, "Add at least one item."),
  walletRedeem: z.coerce.number().min(0).default(0),
  payments: z
    .array(z.object({ method: z.enum(["CASH", "UPI", "CARD"]), amount: z.coerce.number().min(0) }))
    .default([]),
  gstApplied: z.boolean().default(true),
});

export type CreateInvoiceResult =
  | { ok: true; invoiceId: string; number: string }
  | { ok: false; error: string };

export const createInvoice = withErrorLogging("createInvoice", async (input: unknown): Promise<CreateInvoiceResult> => {
  const user = await requireStaff();
  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid bill." };
  }
  const { customerId, lines, walletRedeem, payments, gstApplied } = parsed.data;

  const settings = await prisma.settings.findUniqueOrThrow({ where: { id: "singleton" } });
  const totals = computeInvoiceTotals(lines, {
    gstRatePct: gstApplied ? Number(settings.gstRatePct) : 0,
    pricesIncludeGst: settings.pricesIncludeGst,
  });

  // Resolve active membership for wallet redemption.
  const membership = customerId
    ? await prisma.membership.findFirst({
        where: { customerId, deletedAt: null, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      })
    : null;

  if (walletRedeem > 0 && !membership) {
    return { ok: false, error: "No active membership to redeem from." };
  }

  const walletBalance = membership ? Number(membership.balance) : 0;
  // THE rule: capped to the service subtotal AND the wallet balance.
  const walletRedeemed = capWalletRedemption(walletRedeem, totals.serviceSubtotal, walletBalance);

  const due = round2(totals.grandTotal - walletRedeemed);
  const amountPaid = round2(payments.reduce((s, p) => s + p.amount, 0));
  if (amountPaid > due + 0.001) {
    return { ok: false, error: "Amount paid exceeds the amount due." };
  }
  const balanceDue = Math.max(0, round2(due - amountPaid));
  const status = balanceDue <= 0 ? "PAID" : "PARTIAL";

  // Allocate GST across service/product to record income without double-counting
  // the membership wallet (already booked as income when the plan was sold).
  const base = totals.serviceSubtotal + totals.productSubtotal;
  const serviceTax = base > 0 ? round2((totals.taxTotal * totals.serviceSubtotal) / base) : 0;
  const productTax = round2(totals.taxTotal - serviceTax);
  const productIncome = round2(totals.productSubtotal + productTax);
  const serviceIncome = Math.max(0, round2(totals.serviceSubtotal + serviceTax - walletRedeemed));

  const invoice = await prisma.$transaction(async (tx) => {
    // Reserve the invoice number in one atomic round-trip (returns the row *after*
    // the increment, so the number we just claimed is one less).
    const cur = await tx.settings.update({
      where: { id: "singleton" },
      data: { invoiceNextSeq: { increment: 1 } },
    });
    const seq = cur.invoiceNextSeq - 1;
    const number = formatInvoiceNumber(cur.invoicePrefix, seq, new Date());

    const created = await tx.invoice.create({
      data: {
        number,
        customerId: customerId || null,
        serviceSubtotal: totals.serviceSubtotal,
        productSubtotal: totals.productSubtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        gstApplied,
        grandTotal: totals.grandTotal,
        walletRedeemed,
        amountPaid,
        balanceDue,
        status,
        createdById: user.id,
        items: {
          create: lines.map((l) => ({
            type: l.type,
            refId: l.refId || null,
            name: l.name,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            discount: l.discount ?? 0,
            lineTotal: round2(l.unitPrice * l.quantity - (l.discount ?? 0)),
            employeeId: l.employeeId || null,
          })),
        },
        payments: {
          create: payments
            .filter((p) => p.amount > 0)
            .map((p) => ({ method: p.method, amount: p.amount })),
        },
      },
    });

    // Decrement stock for each product line via a SALE movement.
    const productLines = lines.filter((l) => l.type === "PRODUCT" && l.refId);
    if (productLines.length > 0) {
      await tx.stockMovement.createMany({
        data: productLines.map((l) => ({
          productId: l.refId!,
          type: "SALE" as const,
          quantity: l.quantity,
          invoiceId: created.id,
        })),
      });
      // Sum per product so repeated lines cost a single update each.
      const byProduct = new Map<string, number>();
      for (const l of productLines) {
        byProduct.set(l.refId!, (byProduct.get(l.refId!) ?? 0) + l.quantity);
      }
      for (const [productId, qty] of byProduct) {
        await tx.product.update({ where: { id: productId }, data: { stock: { decrement: qty } } });
      }
    }

    // Debit the wallet (services only).
    if (walletRedeemed > 0 && membership) {
      await tx.membershipTransaction.create({
        data: {
          membershipId: membership.id,
          type: "DEBIT",
          amount: walletRedeemed,
          reason: `Redeemed on ${number}`,
          invoiceId: created.id,
        },
      });
      await tx.membership.update({
        where: { id: membership.id },
        data: { balance: { decrement: walletRedeemed } },
      });
    }

    // A split across methods can't be filtered as any single one — label it
    // "Mixed" rather than picking an arbitrary method to attribute the whole sale to.
    const paidMethods = new Set(payments.filter((p) => p.amount > 0).map((p) => p.method));
    const ledgerMethod: PaymentMethod | null =
      paidMethods.size === 0 ? null : paidMethods.size === 1 ? [...paidMethods][0] : "MIXED";

    // Income ledger entries (excludes wallet-funded service portion).
    const ledger = [];
    if (serviceIncome > 0) {
      ledger.push({ type: "INCOME" as const, category: "SERVICE_SALE" as const, amount: serviceIncome, description: `Services — ${number}`, invoiceId: created.id, paymentMethod: ledgerMethod });
    }
    if (productIncome > 0) {
      ledger.push({ type: "INCOME" as const, category: "PRODUCT_SALE" as const, amount: productIncome, description: `Products — ${number}`, invoiceId: created.id, paymentMethod: ledgerMethod });
    }
    if (ledger.length > 0) await tx.financialTransaction.createMany({ data: ledger });

    return created;
  }, TX_OPTS);

  revalidatePath("/admin/billing-history");
  revalidatePath("/admin/dashboard");
  if (customerId) revalidatePath(`/admin/customers/${customerId}`);

  return { ok: true, invoiceId: invoice.id, number: invoice.number };
});
