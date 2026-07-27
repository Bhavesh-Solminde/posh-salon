"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { ok, zodFail, type ActionResult } from "@/lib/actions";

const schema = z.object({
  id: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  phone: z.string().optional(),
  serviceId: z.string().optional(),
  stylistId: z.string().optional(),
  startAt: z.string().min(1, "Pick a date & time."),
  status: z.enum(["BOOKED", "COMPLETED", "NO_SHOW", "CANCELLED"]),
  notes: z.string().optional(),
});

export async function saveAppointment(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireStaff();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, customerId, customerName, phone, serviceId, stylistId, startAt, status, notes } = parsed.data;

  if (!customerId && !customerName?.trim()) {
    return { ok: false, error: "Choose a customer or enter a walk-in name.", fieldErrors: { customerName: "Required if no customer selected." } };
  }

  const data = {
    customerId: customerId || null,
    customerName: customerId ? null : customerName?.trim() || null,
    phone: phone || null,
    serviceId: serviceId || null,
    stylistId: stylistId || null,
    startAt: new Date(startAt),
    status,
    notes: notes || null,
  };

  if (id) await prisma.appointment.update({ where: { id }, data });
  else await prisma.appointment.create({ data });
  revalidatePath("/admin/appointments");
  return ok(id ? "Appointment updated." : "Appointment booked.");
}

export async function setAppointmentStatus(
  id: string,
  status: "BOOKED" | "COMPLETED" | "NO_SHOW" | "CANCELLED",
): Promise<ActionResult> {
  await requireStaff();
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/admin/appointments");
  return ok("Status updated.");
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.appointment.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/appointments");
  return ok("Appointment removed.");
}
