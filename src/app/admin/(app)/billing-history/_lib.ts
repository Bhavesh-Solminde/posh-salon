import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type LedgerFilters = {
  type?: string;
  category?: string;
  from?: string;
  to?: string;
  q?: string;
  method?: string;
};

const PAYMENT_METHODS = new Set(["CASH", "UPI", "CARD", "MIXED"]);

export function buildWhere(f: LedgerFilters): Prisma.FinancialTransactionWhereInput {
  const where: Prisma.FinancialTransactionWhereInput = { deletedAt: null };
  if (f.type === "INCOME" || f.type === "EXPENSE") where.type = f.type;
  if (f.category)
    where.category = f.category as Prisma.FinancialTransactionWhereInput["category"];
  if (f.method && PAYMENT_METHODS.has(f.method))
    where.paymentMethod = f.method as Prisma.FinancialTransactionWhereInput["paymentMethod"];
  if (f.q) where.description = { contains: f.q, mode: "insensitive" };
  if (f.from || f.to) {
    where.occurredAt = {
      ...(f.from ? { gte: new Date(f.from) } : {}),
      ...(f.to ? { lte: new Date(f.to + "T23:59:59") } : {}),
    };
  }
  return where;
}

export function loadLedger(f: LedgerFilters) {
  return prisma.financialTransaction.findMany({
    where: buildWhere(f),
    orderBy: { occurredAt: "desc" },
    take: 500,
  });
}
