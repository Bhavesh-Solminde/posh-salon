import { randomUUID, webcrypto } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// Node 18 doesn't expose Web Crypto as a global; Better Auth needs it.
if (!globalThis.crypto) {
  (globalThis as unknown as { crypto: Crypto }).crypto = webcrypto as Crypto;
}

const prisma = new PrismaClient();

// A seed-only auth instance WITH sign-up enabled, so staff passwords are hashed
// exactly the way the app expects. The app's own config keeps sign-up disabled.
const seedAuth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
});

async function ensureStaff(
  email: string,
  name: string,
  password: string,
  role: "ADMIN" | "MANAGER" | "CASHIER",
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await seedAuth.api.signUpEmail({ body: { email, password, name } });
  }
  await prisma.user.update({ where: { email }, data: { role, isActive: true } });
}

async function main() {
  // ── Settings (singleton) ──
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      salonName: "Posh Salon",
      tagline: "Premier Hair · Skin · Makeup Atelier",
      addressLine: "Address to be confirmed",
      city: "City to be confirmed",
      phone: "+91 00000 00000",
      gstRatePct: 18,
      pricesIncludeGst: false,
      invoicePrefix: "POSH",
      invoiceNextSeq: 1,
      currency: "INR",
      hoursJson: [
        { day: "Monday — Saturday", time: "Hours to be confirmed" },
        { day: "Sunday", time: "Hours to be confirmed" },
      ],
    },
  });

  // ── Staff (idempotent) ──
  await ensureStaff("admin@posh.salon", "Vatsala", "posh1234", "ADMIN");
  await ensureStaff("manager@posh.salon", "Nisha Rao", "posh1234", "MANAGER");
  await ensureStaff("cashier@posh.salon", "Priya Menon", "posh1234", "CASHIER");

  // ── Website content (guarded independently so it seeds on existing DBs) ──
  if ((await prisma.offer.count()) === 0) {
    await prisma.offer.createMany({
      data: [
        { title: "Bridal Glow Package", description: "Hair, skin & makeup trial included. Book 30 days ahead.", badge: "Signature", sortOrder: 1 },
        { title: "Membership Bonus Month", description: "Load ₹5,000, receive ₹7,000 in service value.", badge: "Limited", sortOrder: 2 },
        { title: "Weekday Spa Ritual", description: "20% off keratin & spa treatments, Mon–Thu.", badge: "20% off", sortOrder: 3 },
      ],
    });
  }
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({
      data: [
        { author: "Ananya Kapoor", role: "Bridal client", quote: "The most pampered I've ever felt. My bridal look was flawless.", rating: 5, sortOrder: 1 },
        { author: "Rhea Malhotra", role: "Member", quote: "The membership wallet makes every visit feel like a treat.", rating: 5, sortOrder: 2 },
        { author: "Simran Bedi", role: "Regular", quote: "Impeccable service and a genuinely calming space.", rating: 5, sortOrder: 3 },
      ],
    });
  }

  // Domain data seeds once (guard on Service count).
  if ((await prisma.service.count()) > 0) {
    console.log("Domain data already seeded — skipping.");
    return;
  }

  // ── Membership plans (placeholder values, editable in Settings) ──
  const plans = await Promise.all([
    prisma.membershipPlan.create({
      data: { name: "Silver", tier: "SILVER", price: 3000, validityDays: 365, bonusAmount: 0, discountPct: 5 },
    }),
    prisma.membershipPlan.create({
      data: { name: "Gold", tier: "GOLD", price: 5000, validityDays: 365, bonusAmount: 2000, discountPct: 10 },
    }),
    prisma.membershipPlan.create({
      data: { name: "Platinum", tier: "PLATINUM", price: 10000, validityDays: 365, bonusAmount: 5000, discountPct: 15 },
    }),
  ]);

  // ── Service categories + services ──
  const catFacial = await prisma.serviceCategory.create({ data: { name: "Facials", sortOrder: 1 } });
  const catMakeup = await prisma.serviceCategory.create({ data: { name: "Makeup", sortOrder: 2 } });
  const catHair = await prisma.serviceCategory.create({ data: { name: "Hair", sortOrder: 3 } });

  await prisma.service.createMany({
    data: [
      { name: "Hydra Facial", categoryId: catFacial.id, durationMin: 60, price: 2500 },
      { name: "Korean Glass Facial", categoryId: catFacial.id, durationMin: 75, price: 3000 },
      { name: "HD Makeup", categoryId: catMakeup.id, durationMin: 90, price: 4000 },
      { name: "Bridal Makeup", categoryId: catMakeup.id, durationMin: 180, price: 12000 },
      { name: "Haircut & Style", categoryId: catHair.id, durationMin: 45, price: 800 },
      { name: "Hair Colour", categoryId: catHair.id, durationMin: 120, price: 3500 },
    ],
  });

  // ── Products (+ opening-stock movement for auditability) ──
  const products = [
    { name: "Argan Repair Shampoo", sku: "SHP-001", category: "Hair Care", salePrice: 950, costPrice: 520, stock: 24, reorderLevel: 6, use: "BOTH" as const },
    { name: "Hydrating Serum", sku: "SRM-002", category: "Skin Care", salePrice: 1500, costPrice: 800, stock: 12, reorderLevel: 4, use: "RETAIL" as const },
    { name: "Salon Developer 20vol", sku: "DEV-003", category: "Colour", salePrice: 0, costPrice: 300, stock: 3, reorderLevel: 5, use: "IN_SALON" as const },
  ];
  for (const p of products) {
    const created = await prisma.product.create({ data: p });
    await prisma.stockMovement.create({
      data: { productId: created.id, type: "PURCHASE", quantity: p.stock, unitCost: p.costPrice, note: "Opening stock" },
    });
  }

  // ── Customers ──
  const c1 = await prisma.customer.create({
    data: { name: "Ananya Iyer", phone: "9800000001", gender: "Female", notes: "Prefers Korean facial." },
  });
  await prisma.customer.create({
    data: { name: "Rohan Gupta", phone: "9800000002", gender: "Male" },
  });

  // ── One demo membership with a funded wallet (Gold: 5000 paid → 7000 wallet) ──
  const gold = plans[1];
  const walletValue = Number(gold.price) + Number(gold.bonusAmount);
  const membership = await prisma.membership.create({
    data: {
      membershipNo: "POSH-000001",
      qrToken: randomUUID(),
      customerId: c1.id,
      planId: gold.id,
      tier: "GOLD",
      status: "ACTIVE",
      balance: walletValue,
      expiresAt: new Date(Date.now() + gold.validityDays * 86400000),
    },
  });
  await prisma.membershipTransaction.create({
    data: { membershipId: membership.id, type: "CREDIT", amount: Number(gold.price), reason: "Membership purchase" },
  });
  await prisma.membershipTransaction.create({
    data: { membershipId: membership.id, type: "CREDIT", amount: Number(gold.bonusAmount), reason: "Plan bonus" },
  });
  await prisma.financialTransaction.create({
    data: { type: "INCOME", category: "MEMBERSHIP_SALE", amount: Number(gold.price), description: "Gold membership — POSH-000001", membershipId: membership.id },
  });

  // ── Employees ──
  await prisma.employee.createMany({
    data: [
      { name: "Meera Nair", role: "Senior Stylist", joinedAt: new Date("2024-01-15") },
      { name: "Karan Verma", role: "Makeup Artist", joinedAt: new Date("2024-06-01") },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
