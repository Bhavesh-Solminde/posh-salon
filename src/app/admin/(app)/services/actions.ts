"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireStaff, requireRole } from "@/lib/session";
import { ok, fail, zodFail, withErrorLogging, type ActionResult } from "@/lib/actions";

const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  categoryId: z.string().optional(),
  durationMin: z.union([z.coerce.number().int().min(0), z.literal("")]).optional(),
  price: z.coerce.number().min(0, "Must be ≥ 0"),
  description: z.string().optional(),
});

export const saveService = withErrorLogging("saveService", async (
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> => {
  await requireStaff();
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, durationMin, categoryId, description, ...rest } = parsed.data;
  const data = {
    ...rest,
    categoryId: categoryId || null,
    durationMin: durationMin === "" || durationMin === undefined ? null : Number(durationMin),
    description: description || null,
    isActive: formData.get("isActive") === "on",
  };
  if (id) await prisma.service.update({ where: { id }, data });
  else await prisma.service.create({ data });
  revalidatePath("/admin/services");
  revalidatePath("/");
  return ok(id ? "Service updated." : "Service created.");
});

export const deleteService = withErrorLogging("deleteService", async (id: string): Promise<ActionResult> => {
  await requireStaff();
  await prisma.service.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  revalidatePath("/admin/services");
  revalidatePath("/");
  return ok("Service removed.");
});

export const saveCategory = withErrorLogging("saveCategory", async (
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> => {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return fail("Category name is required.", { name: "Required." });
  const existing = await prisma.serviceCategory.findUnique({ where: { name } });
  if (existing) return fail("That category already exists.", { name: "Already exists." });
  await prisma.serviceCategory.create({ data: { name } });
  revalidatePath("/admin/services");
  revalidatePath("/");
  return ok("Category added.");
});

export const deleteCategory = withErrorLogging("deleteCategory", async (id: string): Promise<ActionResult> => {
  await requireRole("MANAGER");
  await prisma.service.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await prisma.serviceCategory.delete({ where: { id } });
  revalidatePath("/admin/services");
  revalidatePath("/");
  return ok("Category removed.");
});
