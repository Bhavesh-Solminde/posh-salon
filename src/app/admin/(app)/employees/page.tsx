import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { filterControlClass } from "@/components/admin/ui/FilterBar";
import { EmployeesManager } from "./_components/EmployeesManager";
import { formatISODate, toDateInput } from "@/lib/format";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireRole("MANAGER");
  const sp = await searchParams;
  const date = sp.date ?? toDateInput(new Date());
  const dayStart = new Date(date + "T00:00:00");

  const employees = await prisma.employee.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: { attendance: { where: { date: dayStart } } },
  });

  return (
    <div>
      <PageHeader
        title="Employees & Attendance"
        description="Staff records and daily attendance. No payroll."
        actions={
          <form method="get" className="flex items-end gap-2">
            <div>
              <label htmlFor="attendance-date" className="text-meta uppercase text-ink-muted">
                Attendance date
              </label>
              <div className="mt-1.5">
                <input
                  id="attendance-date"
                  type="date"
                  name="date"
                  defaultValue={date}
                  className={filterControlClass}
                />
              </div>
            </div>
            <AdminButton type="submit" variant="secondary">
              Show
            </AdminButton>
          </form>
        }
      />
      <div className="p-4 sm:p-6">
        <Panel>
          <EmployeesManager
            date={date}
            dateLabel={formatISODate(date)}
            employees={employees.map((e) => ({
              id: e.id,
              name: e.name,
              role: e.role,
              phone: e.phone,
              joinedAt: e.joinedAt ? e.joinedAt.toISOString().slice(0, 10) : null,
              isActive: e.isActive,
              attendance: e.attendance[0]?.status ?? null,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
