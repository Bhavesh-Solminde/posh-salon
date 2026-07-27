"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { ok, zodFail, withErrorLogging, type ActionResult } from "@/lib/actions";

const expenseSchema = z.object({
  category: z.enum(["MISC_EXPENSE", "SUPPLIER_PURCHASE"]),
  amount: z.coerce.number().positive("Enter an amount."),
  description: z.string().min(1, "Add a note."),
  occurredAt: z.string().optional(),
});

export const recordExpense = withErrorLogging("recordExpense", async (
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> => {
  const user = await requireStaff();
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { category, amount, description, occurredAt } = parsed.data;

  await prisma.financialTransaction.create({
    data: {
      type: "EXPENSE",
      category,
      amount,
      description,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      createdById: user.id,
    },
  });
  revalidatePath("/admin/billing-history");
  revalidatePath("/admin/dashboard");
  return ok("Expense recorded.");
});
