"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { ok, zodFail, withErrorLogging, type ActionResult } from "@/lib/actions";

const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  role: z.string().min(1, "Role is required."),
  phone: z.string().optional(),
  joinedAt: z.string().optional(),
});

export const saveEmployee = withErrorLogging("saveEmployee", async (
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> => {
  await requireRole("MANAGER");
  const parsed = employeeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodFail(parsed.error);
  const { id, phone, joinedAt, ...rest } = parsed.data;
  const data = {
    ...rest,
    phone: phone || null,
    joinedAt: joinedAt ? new Date(joinedAt) : null,
    isActive: formData.get("isActive") === "on",
  };
  if (id) await prisma.employee.update({ where: { id }, data });
  else await prisma.employee.create({ data });
  revalidatePath("/admin/employees");
  return ok(id ? "Employee updated." : "Employee added.");
});

export const deleteEmployee = withErrorLogging("deleteEmployee", async (id: string): Promise<ActionResult> => {
  await requireRole("MANAGER");
  await prisma.employee.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  revalidatePath("/admin/employees");
  return ok("Employee removed.");
});

export const markAttendance = withErrorLogging("markAttendance", async (
  employeeId: string,
  dateStr: string,
  status: "PRESENT" | "ABSENT" | "LEAVE",
): Promise<ActionResult> => {
  await requireRole("MANAGER");
  const date = new Date(dateStr + "T00:00:00");
  await prisma.attendanceRecord.upsert({
    where: { employeeId_date: { employeeId, date } },
    update: { status },
    create: { employeeId, date, status },
  });
  revalidatePath("/admin/employees");
  return ok("Attendance saved.");
});
