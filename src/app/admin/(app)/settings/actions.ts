"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ok, zodFail, withErrorLogging, type ActionResult } from "@/lib/actions";

const settingsSchema = z.object({
  salonName: z.string().min(1, "Salon name is required."),
  tagline: z.string().optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.union([z.string().email("Enter a valid email."), z.literal("")]).optional(),
  gstNumber: z.string().optional(),
  gstRatePct: z.coerce.number().min(0, "Must be ≥ 0").max(100, "Must be ≤ 100"),
  invoicePrefix: z.string().min(1, "Prefix is required."),
});

export const updateSettings = withErrorLogging("updateSettings", async (
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> => {
  await requireRole("ADMIN");
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const d = parsed.data;

  await prisma.settings.update({
    where: { id: "singleton" },
    data: {
      salonName: d.salonName,
      tagline: d.tagline || null,
      addressLine: d.addressLine || null,
      city: d.city || null,
      phone: d.phone || null,
      whatsapp: d.whatsapp || null,
      email: d.email || null,
      gstNumber: d.gstNumber || null,
      gstRatePct: d.gstRatePct,
      pricesIncludeGst: formData.get("pricesIncludeGst") === "on",
      invoicePrefix: d.invoicePrefix,
    },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return ok("Settings saved.");
});

const planSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  tier: z.enum(["SILVER", "GOLD", "PLATINUM", "CUSTOM"]),
  price: z.coerce.number().min(0, "Must be ≥ 0"),
  validityDays: z.coerce.number().int().min(1, "Must be ≥ 1 day"),
  bonusAmount: z.coerce.number().min(0, "Must be ≥ 0"),
  discountPct: z.coerce.number().min(0).max(100),
});

export const savePlan = withErrorLogging("savePlan", async (
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> => {
  await requireRole("ADMIN");
  const parsed = planSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, ...data } = parsed.data;
  const isActive = formData.get("isActive") === "on";

  if (id) {
    await prisma.membershipPlan.update({ where: { id }, data: { ...data, isActive } });
  } else {
    await prisma.membershipPlan.create({ data: { ...data, isActive } });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return ok(id ? "Plan updated." : "Plan created.");
});

export const deletePlan = withErrorLogging("deletePlan", async (id: string): Promise<ActionResult> => {
  await requireRole("ADMIN");
  await prisma.membershipPlan.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return ok("Plan removed.");
});
