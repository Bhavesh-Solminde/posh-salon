"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ok, zodFail, withErrorLogging, type ActionResult } from "@/lib/actions";

const offerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  badge: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

const testimonialSchema = z.object({
  id: z.string().optional(),
  author: z.string().min(1, "Author is required."),
  role: z.string().optional(),
  quote: z.string().min(1, "Quote is required."),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  sortOrder: z.coerce.number().int().default(0),
});

export const saveOffer = withErrorLogging("saveOffer", async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  await requireRole("MANAGER");
  const parsed = offerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, description, badge, ...rest } = parsed.data;
  const data = {
    ...rest,
    description: description || null,
    badge: badge || null,
    active: formData.get("active") === "on",
  };
  if (id) await prisma.offer.update({ where: { id }, data });
  else await prisma.offer.create({ data });
  revalidatePath("/admin/website");
  revalidatePath("/");
  return ok(id ? "Offer updated." : "Offer added.");
});

export const deleteOffer = withErrorLogging("deleteOffer", async (id: string): Promise<ActionResult> => {
  await requireRole("MANAGER");
  await prisma.offer.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  revalidatePath("/admin/website");
  revalidatePath("/");
  return ok("Offer removed.");
});

export const saveTestimonial = withErrorLogging("saveTestimonial", async (_prev: ActionResult, formData: FormData): Promise<ActionResult> => {
  await requireRole("MANAGER");
  const parsed = testimonialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, role, ...rest } = parsed.data;
  const data = {
    ...rest,
    role: role || null,
    active: formData.get("active") === "on",
  };
  if (id) await prisma.testimonial.update({ where: { id }, data });
  else await prisma.testimonial.create({ data });
  revalidatePath("/admin/website");
  revalidatePath("/");
  return ok(id ? "Testimonial updated." : "Testimonial added.");
});

export const deleteTestimonial = withErrorLogging("deleteTestimonial", async (id: string): Promise<ActionResult> => {
  await requireRole("MANAGER");
  await prisma.testimonial.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  revalidatePath("/admin/website");
  revalidatePath("/");
  return ok("Testimonial removed.");
});
