// Adds realistic-looking dummy employees + customers (with memberships, wallet
// transactions, and purchase invoices) on top of whatever `prisma/seed.ts` has
// already created. Safe to re-run: each customer/employee is keyed by phone and
// skipped if it already exists, so nothing is duplicated.
//
// Usage: npm run seed:dummy

import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
  computeInvoiceTotals,
  capWalletRedemption,
  formatInvoiceNumber,
  round2,
  type BillLine,
} from "../src/lib/money";

const prisma = new PrismaClient();

// ─────────────────────────── small random helpers ───────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function chance(pct: number): boolean {
  return Math.random() * 100 < pct;
}

function weightedPick<T>(entries: [T, number][]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [value, w] of entries) {
    if (r < w) return value;
    r -= w;
  }
  return entries[entries.length - 1][0];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const DAY_MS = 86_400_000;

// ─────────────────────────── dummy source data ───────────────────────────

const EMPLOYEES: { name: string; role: string; phone: string; joinedAt: Date; isActive?: boolean }[] = [
  { name: "Ritika Desai", role: "Hair Colourist", phone: "9811100001", joinedAt: new Date("2023-03-10") },
  { name: "Farhan Sheikh", role: "Senior Stylist", phone: "9811100002", joinedAt: new Date("2022-07-22") },
  { name: "Kavita Iyer", role: "Spa Therapist", phone: "9811100003", joinedAt: new Date("2024-01-05") },
  { name: "Rohit Bhatia", role: "Nail Technician", phone: "9811100004", joinedAt: new Date("2023-11-18") },
  { name: "Sanya Kapoor", role: "Junior Stylist", phone: "9811100005", joinedAt: new Date("2024-08-01") },
  { name: "Manish Tiwari", role: "Beautician", phone: "9811100006", joinedAt: new Date("2023-05-14") },
  { name: "Alia Fernandes", role: "Front Desk", phone: "9811100007", joinedAt: new Date("2024-02-20") },
  { name: "Dev Patel", role: "Makeup Artist", phone: "9811100008", joinedAt: new Date("2022-10-09"), isActive: false },
];

const CUSTOMERS: {
  name: string;
  phone: string;
  gender: "Female" | "Male";
  birthday: Date;
  anniversary?: Date;
  notes?: string;
  allergies?: string;
}[] = [
  { name: "Priya Sharma", phone: "9700000001", gender: "Female", birthday: new Date("1992-04-12"), notes: "Prefers Hydra Facial." },
  { name: "Rahul Verma", phone: "9700000002", gender: "Male", birthday: new Date("1988-11-03") },
  { name: "Sneha Reddy", phone: "9700000003", gender: "Female", birthday: new Date("1995-06-25"), anniversary: new Date("2019-02-14") },
  { name: "Arjun Nair", phone: "9700000004", gender: "Male", birthday: new Date("1990-01-30") },
  { name: "Kavya Menon", phone: "9700000005", gender: "Female", birthday: new Date("1998-09-17"), allergies: "Sensitive to ammonia-based colour." },
  { name: "Vikram Malhotra", phone: "9700000006", gender: "Male", birthday: new Date("1985-03-08"), anniversary: new Date("2012-12-01") },
  { name: "Divya Pillai", phone: "9700000007", gender: "Female", birthday: new Date("1993-07-21") },
  { name: "Aditya Kapoor", phone: "9700000008", gender: "Male", birthday: new Date("1991-05-19") },
  { name: "Neha Joshi", phone: "9700000009", gender: "Female", birthday: new Date("1996-12-02"), notes: "Regular for keratin spa." },
  { name: "Rohan Desai", phone: "9700000010", gender: "Male", birthday: new Date("1989-08-14") },
  { name: "Ishita Bansal", phone: "9700000011", gender: "Female", birthday: new Date("1994-02-28"), anniversary: new Date("2021-11-27") },
  { name: "Karthik Iyer", phone: "9700000012", gender: "Male", birthday: new Date("1987-10-05") },
  { name: "Pooja Chawla", phone: "9700000013", gender: "Female", birthday: new Date("1997-01-16"), allergies: "Reacts to fragrance-heavy products." },
  { name: "Siddharth Rao", phone: "9700000014", gender: "Male", birthday: new Date("1992-06-09") },
  { name: "Meera Krishnan", phone: "9700000015", gender: "Female", birthday: new Date("1999-03-22") },
  { name: "Varun Khanna", phone: "9700000016", gender: "Male", birthday: new Date("1986-09-27"), anniversary: new Date("2015-01-24") },
  { name: "Ananya Bhatt", phone: "9700000017", gender: "Female", birthday: new Date("1995-11-11"), notes: "Bridal client — trial booked separately." },
  { name: "Nikhil Saxena", phone: "9700000018", gender: "Male", birthday: new Date("1990-12-19") },
];

// ─────────────────────────── main ───────────────────────────

async function main() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const services = await prisma.service.findMany({ where: { deletedAt: null } });
  const products = await prisma.product.findMany({ where: { deletedAt: null, salePrice: { gt: 0 } } });
  const plans = await prisma.membershipPlan.findMany({ where: { deletedAt: null } });
  const staff = await prisma.user.findMany();

  if (!settings) throw new Error("Run `npm run db:seed` first (missing Settings row).");
  if (services.length === 0) throw new Error("Run `npm run db:seed` first (no services found).");

  // ── Employees + ~4 weeks of attendance ──
  const employeeIds: string[] = [];
  for (const e of EMPLOYEES) {
    const existing = await prisma.employee.findFirst({ where: { phone: e.phone } });
    if (existing) {
      employeeIds.push(existing.id);
      continue;
    }
    const created = await prisma.employee.create({
      data: {
        name: e.name,
        role: e.role,
        phone: e.phone,
        joinedAt: e.joinedAt,
        isActive: e.isActive ?? true,
      },
    });
    employeeIds.push(created.id);

    const today = new Date();
    const attendanceRows = [];
    for (let i = 0; i < 28; i++) {
      const date = new Date(today.getTime() - i * DAY_MS);
      if (date.getDay() === 0) continue; // salon closed Sundays
      const status = weightedPick([
        ["PRESENT", 85],
        ["ABSENT", 7],
        ["LEAVE", 8],
      ] as [("PRESENT" | "ABSENT" | "LEAVE"), number][]);
      attendanceRows.push({
        employeeId: created.id,
        date: new Date(date.toDateString()),
        status,
      });
    }
    await prisma.attendanceRecord.createMany({ data: attendanceRows, skipDuplicates: true });
  }
  console.log(`Employees ready: ${employeeIds.length}`);

  // ── Customers + memberships + purchase history ──
  let membershipCount = await prisma.membership.count();
  let created = 0;
  let skipped = 0;

  for (const c of CUSTOMERS) {
    const existing = await prisma.customer.findFirst({ where: { phone: c.phone } });
    if (existing) {
      skipped++;
      continue;
    }

    const emailHandle = c.name.toLowerCase().replace(/\s+/g, ".");
    const customer = await prisma.customer.create({
      data: {
        name: c.name,
        phone: c.phone,
        email: `${emailHandle}@example.com`,
        gender: c.gender,
        birthday: c.birthday,
        anniversary: c.anniversary ?? null,
        notes: c.notes ?? null,
        allergies: c.allergies ?? null,
      },
    });

    const staffId = staff.length > 0 ? pick(staff).id : undefined;

    // ~70% of customers hold a membership.
    let membership: { id: string; balance: number } | null = null;
    if (plans.length > 0 && chance(70)) {
      const plan = weightedPick([
        [plans.find((p) => p.tier === "SILVER") ?? plans[0], 40],
        [plans.find((p) => p.tier === "GOLD") ?? plans[0], 40],
        [plans.find((p) => p.tier === "PLATINUM") ?? plans[0], 20],
      ]);
      const price = Number(plan.price);
      const bonus = Number(plan.bonusAmount);
      const wallet = price + bonus;
      const joinedAt = randomDate(new Date(Date.now() - 300 * DAY_MS), new Date(Date.now() - 20 * DAY_MS));
      membershipCount++;
      const membershipNo = `POSH-${String(membershipCount).padStart(6, "0")}`;

      const m = await prisma.membership.create({
        data: {
          membershipNo,
          qrToken: randomUUID(),
          customerId: customer.id,
          planId: plan.id,
          tier: plan.tier,
          status: "ACTIVE",
          balance: wallet,
          joinedAt,
          expiresAt: new Date(joinedAt.getTime() + plan.validityDays * DAY_MS),
        },
      });
      await prisma.membershipTransaction.create({
        data: { membershipId: m.id, type: "CREDIT", amount: price, reason: "Membership purchase", createdById: staffId, createdAt: joinedAt },
      });
      if (bonus > 0) {
        await prisma.membershipTransaction.create({
          data: { membershipId: m.id, type: "CREDIT", amount: bonus, reason: "Plan bonus", createdById: staffId, createdAt: joinedAt },
        });
      }
      await prisma.financialTransaction.create({
        data: {
          type: "INCOME",
          category: "MEMBERSHIP_SALE",
          amount: price,
          description: `${plan.name} membership — ${membershipNo}`,
          membershipId: m.id,
          createdById: staffId,
          occurredAt: joinedAt,
          createdAt: joinedAt,
        },
      });
      membership = { id: m.id, balance: wallet };
    }

    // ── 1–5 purchase invoices spread across the last ~9 months ──
    const stockLeft = new Map(products.map((p) => [p.id, p.stock]));
    const numInvoices = randomInt(1, 5);
    const invoiceDates = Array.from({ length: numInvoices }, () =>
      randomDate(new Date(Date.now() - 270 * DAY_MS), new Date()),
    ).sort((a, b) => a.getTime() - b.getTime());

    for (const invoiceDate of invoiceDates) {
      const lines: (BillLine & { refId: string | null; name: string })[] = [];
      const numLines = randomInt(1, 3);
      for (let i = 0; i < numLines; i++) {
        if (products.length > 0 && chance(30)) {
          const product = pick(products);
          const available = stockLeft.get(product.id) ?? 0;
          if (available <= 0) {
            const svc = pick(services);
            lines.push({ type: "SERVICE", refId: svc.id, name: svc.name, unitPrice: Number(svc.price), quantity: 1 });
            continue;
          }
          const qty = Math.min(randomInt(1, 2), available);
          stockLeft.set(product.id, available - qty);
          lines.push({
            type: "PRODUCT",
            refId: product.id,
            name: product.name,
            unitPrice: Number(product.salePrice),
            quantity: qty,
            discount: chance(15) ? round2(Number(product.salePrice) * qty * 0.1) : 0,
          });
        } else {
          const svc = pick(services);
          lines.push({
            type: "SERVICE",
            refId: svc.id,
            name: svc.name,
            unitPrice: Number(svc.price),
            quantity: 1,
            discount: chance(15) ? round2(Number(svc.price) * 0.1) : 0,
          });
        }
      }

      const totals = computeInvoiceTotals(lines, {
        gstRatePct: Number(settings.gstRatePct),
        pricesIncludeGst: settings.pricesIncludeGst,
      });

      let walletRedeemed = 0;
      if (membership && membership.balance > 0 && totals.serviceSubtotal > 0 && chance(50)) {
        const requested = round2(totals.serviceSubtotal * (randomInt(30, 100) / 100));
        walletRedeemed = capWalletRedemption(requested, totals.serviceSubtotal, membership.balance);
      }

      const due = round2(totals.grandTotal - walletRedeemed);
      const fullyPaid = chance(80);
      const amountPaid = fullyPaid ? due : round2(due * (randomInt(40, 85) / 100));
      const balanceDue = Math.max(0, round2(due - amountPaid));
      const status: "PAID" | "PARTIAL" = balanceDue <= 0 ? "PAID" : "PARTIAL";

      const base = totals.serviceSubtotal + totals.productSubtotal;
      const serviceTax = base > 0 ? round2((totals.taxTotal * totals.serviceSubtotal) / base) : 0;
      const productTax = round2(totals.taxTotal - serviceTax);
      const productIncome = round2(totals.productSubtotal + productTax);
      const serviceIncome = Math.max(0, round2(totals.serviceSubtotal + serviceTax - walletRedeemed));

      const paymentMethods: ("CASH" | "UPI" | "CARD")[] =
        amountPaid > 0 && chance(15)
          ? [pick(["CASH", "UPI", "CARD"] as const), pick(["CASH", "UPI", "CARD"] as const)]
          : amountPaid > 0
            ? [pick(["CASH", "UPI", "CARD"] as const)]
            : [];
      const payments =
        paymentMethods.length === 2
          ? [
              { method: paymentMethods[0], amount: round2(amountPaid / 2) },
              { method: paymentMethods[1], amount: round2(amountPaid - round2(amountPaid / 2)) },
            ]
          : paymentMethods.length === 1
            ? [{ method: paymentMethods[0], amount: amountPaid }]
            : [];

      const cur = await prisma.settings.update({
        where: { id: "singleton" },
        data: { invoiceNextSeq: { increment: 1 } },
      });
      const seq = cur.invoiceNextSeq - 1;
      const number = formatInvoiceNumber(cur.invoicePrefix, seq, invoiceDate);

      const invoice = await prisma.invoice.create({
        data: {
          number,
          customerId: customer.id,
          serviceSubtotal: totals.serviceSubtotal,
          productSubtotal: totals.productSubtotal,
          discountTotal: totals.discountTotal,
          taxTotal: totals.taxTotal,
          grandTotal: totals.grandTotal,
          walletRedeemed,
          amountPaid,
          balanceDue,
          status,
          createdById: staffId,
          createdAt: invoiceDate,
          items: {
            create: lines.map((l) => ({
              type: l.type,
              refId: l.refId,
              name: l.name,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              discount: l.discount ?? 0,
              lineTotal: round2(l.unitPrice * l.quantity - (l.discount ?? 0)),
            })),
          },
          payments: { create: payments.map((p) => ({ ...p, createdAt: invoiceDate })) },
        },
      });

      const productLines = lines.filter((l) => l.type === "PRODUCT" && l.refId);
      if (productLines.length > 0) {
        await prisma.stockMovement.createMany({
          data: productLines.map((l) => ({
            productId: l.refId!,
            type: "SALE" as const,
            quantity: l.quantity,
            invoiceId: invoice.id,
            createdById: staffId,
            createdAt: invoiceDate,
          })),
        });
        const byProduct = new Map<string, number>();
        for (const l of productLines) byProduct.set(l.refId!, (byProduct.get(l.refId!) ?? 0) + l.quantity);
        for (const [productId, qty] of byProduct) {
          await prisma.product.update({ where: { id: productId }, data: { stock: { decrement: qty } } });
        }
      }

      if (walletRedeemed > 0 && membership) {
        await prisma.membershipTransaction.create({
          data: {
            membershipId: membership.id,
            type: "DEBIT",
            amount: walletRedeemed,
            reason: `Redeemed on ${number}`,
            invoiceId: invoice.id,
            createdById: staffId,
            createdAt: invoiceDate,
          },
        });
        await prisma.membership.update({ where: { id: membership.id }, data: { balance: { decrement: walletRedeemed } } });
        membership.balance = round2(membership.balance - walletRedeemed);
      }

      const ledger = [];
      if (serviceIncome > 0) {
        ledger.push({ type: "INCOME" as const, category: "SERVICE_SALE" as const, amount: serviceIncome, description: `Services — ${number}`, invoiceId: invoice.id, createdById: staffId, occurredAt: invoiceDate, createdAt: invoiceDate });
      }
      if (productIncome > 0) {
        ledger.push({ type: "INCOME" as const, category: "PRODUCT_SALE" as const, amount: productIncome, description: `Products — ${number}`, invoiceId: invoice.id, createdById: staffId, occurredAt: invoiceDate, createdAt: invoiceDate });
      }
      if (ledger.length > 0) await prisma.financialTransaction.createMany({ data: ledger });
    }

    created++;
  }

  console.log(`Customers created: ${created}, already present (skipped): ${skipped}`);
  console.log("Dummy data seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
