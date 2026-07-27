import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { AppointmentsManager } from "./_components/AppointmentsManager";
import { formatSchedule, toDateTimeInput } from "@/lib/format";

export default async function AppointmentsPage() {
  await requireStaff();
  const [appointments, customers, services, stylists] = await Promise.all([
    prisma.appointment.findMany({
      where: { deletedAt: null },
      orderBy: { startAt: "desc" },
      take: 200,
      include: { customer: true, service: true, stylist: true },
    }),
    prisma.customer.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, take: 500 }),
    prisma.service.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { name: "asc" } }),
    prisma.employee.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const booked = appointments.filter((a) => a.status === "BOOKED").length;

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Walk-in and future bookings, reschedules, cancellations, and no-shows."
      />
      <div className="p-4 sm:p-6">
        <Panel>
          <AppointmentsManager
            bookedCount={booked}
            customers={customers.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
            services={services.map((s) => ({ id: s.id, name: s.name }))}
            stylists={stylists.map((e) => ({ id: e.id, name: e.name }))}
            appointments={appointments.map((a) => ({
              id: a.id,
              customerId: a.customerId,
              customerLabel: a.customer?.name ?? a.customerName ?? "Walk-in",
              phone: a.phone,
              serviceId: a.serviceId,
              serviceName: a.service?.name ?? null,
              stylistId: a.stylistId,
              stylistName: a.stylist?.name ?? null,
              startAtISO: toDateTimeInput(a.startAt),
              startAtLabel: formatSchedule(a.startAt),
              status: a.status,
              notes: a.notes,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
