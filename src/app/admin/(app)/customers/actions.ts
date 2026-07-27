"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { ok, fail, zodFail, type ActionResult } from "@/lib/actions";

const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  phone: z.string().regex(/^[0-9+\-\s]{7,}$/, "Enter a valid phone number."),
  email: z.union([z.string().email("Enter a valid email."), z.literal("")]).optional(),
  gender: z.string().optional(),
  birthday: z.string().optional(),
  anniversary: z.string().optional(),
  notes: z.string().optional(),
  allergies: z.string().optional(),
});

const toDate = (s?: string) => (s ? new Date(s) : null);

export async function saveCustomer(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireStaff();
  const parsed = customerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, phone, email, ...rest } = parsed.data;

  // Phone is the unique lookup key.
  const clash = await prisma.customer.findFirst({
    where: { phone, deletedAt: null, ...(id ? { NOT: { id } } : {}) },
  });
  if (clash) return fail("A customer with this phone already exists.", { phone: "Already registered." });

  const data = {
    name: rest.name,
    phone,
    email: email || null,
    gender: rest.gender || null,
    birthday: toDate(rest.birthday),
    anniversary: toDate(rest.anniversary),
    notes: rest.notes || null,
    allergies: rest.allergies || null,
  };

  const saved = id
    ? await prisma.customer.update({ where: { id }, data })
    : await prisma.customer.create({ data });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${saved.id}`);
  return ok(id ? "Customer updated." : "Customer registered.");
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/customers");
  return ok("Customer removed.");
}
