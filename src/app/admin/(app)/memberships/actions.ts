"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma, TX_OPTS } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { ok, fail, zodFail, type ActionResult } from "@/lib/actions";

const createSchema = z.object({
  customerId: z.string().min(1, "Choose a customer."),
  planId: z.string().min(1, "Choose a plan."),
  paymentMethod: z.enum(["CASH", "UPI", "CARD"]),
  notes: z.string().optional(),
});

export async function createMembership(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireStaff();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { customerId, planId, paymentMethod, notes } = parsed.data;

  const [customer, plan] = await Promise.all([
    prisma.customer.findFirst({ where: { id: customerId, deletedAt: null } }),
    prisma.membershipPlan.findFirst({ where: { id: planId, deletedAt: null } }),
  ]);
  if (!customer) return fail("Customer not found.");
  if (!plan) return fail("Plan not found.");

  const price = Number(plan.price);
  const bonus = Number(plan.bonusAmount);
  const wallet = price + bonus;

  await prisma.$transaction(async (tx) => {
    const count = await tx.membership.count();
    const membershipNo = `POSH-${String(count + 1).padStart(6, "0")}`;
    const membership = await tx.membership.create({
      data: {
        membershipNo,
        qrToken: randomUUID(),
        customerId,
        planId,
        tier: plan.tier,
        status: "ACTIVE",
        balance: wallet,
        expiresAt: new Date(Date.now() + plan.validityDays * 86400000),
        notes: notes || null,
      },
    });
    await tx.membershipTransaction.create({
      data: { membershipId: membership.id, type: "CREDIT", amount: price, reason: "Membership purchase" },
    });
    if (bonus > 0) {
      await tx.membershipTransaction.create({
        data: { membershipId: membership.id, type: "CREDIT", amount: bonus, reason: "Plan bonus" },
      });
    }
    await tx.financialTransaction.create({
      data: {
        type: "INCOME",
        category: "MEMBERSHIP_SALE",
        amount: price,
        description: `${plan.name} membership — ${membershipNo} (${paymentMethod})`,
        membershipId: membership.id,
      },
    });
  }, TX_OPTS);

  revalidatePath("/admin/memberships");
  revalidatePath(`/admin/customers/${customerId}`);
  return ok(`Membership created for ${customer.name}.`);
}
