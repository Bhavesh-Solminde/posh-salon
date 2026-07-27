import Link from "next/link";
import {
  CalendarDays,
  IndianRupee,
  Receipt,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel, PanelHeader } from "@/components/admin/ui/Panel";
import {
  DataTable,
  tableIdLinkClass,
  tableLinkClass,
  type Column,
} from "@/components/admin/ui/DataTable";
import { StatusChip, type ChipTone } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { formatINR } from "@/lib/money";
import { formatSchedule, formatTime } from "@/lib/format";

const LOW_BALANCE = 500;

const APPT_TONE: Record<string, ChipTone> = {
  BOOKED: "info", COMPLETED: "success", NO_SHOW: "danger", CANCELLED: "danger",
};

function dayRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return { start, end };
}

/** "View all" — the quiet exit from a summary panel into its full section. */
function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-ui-sm text-gold-shadow transition-colors duration-150 hover:text-ink hover:underline"
    >
      View all<span className="sr-only"> {label}</span>
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await requireStaff();
  const { start, end } = dayRange();

  const [revenueAgg, invoiceCount, apptCount, newMemberships, recentInvoices, lowBalances, upcoming] =
    await Promise.all([
      prisma.financialTransaction.aggregate({
        where: { deletedAt: null, type: "INCOME", occurredAt: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
      prisma.invoice.count({ where: { deletedAt: null, createdAt: { gte: start, lt: end } } }),
      prisma.appointment.count({ where: { deletedAt: null, startAt: { gte: start, lt: end } } }),
      prisma.membership.count({ where: { deletedAt: null, createdAt: { gte: start, lt: end } } }),
      prisma.invoice.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, number: true, grandTotal: true, createdAt: true, customer: { select: { name: true } } },
      }),
      prisma.membership.findMany({
        where: { deletedAt: null, status: "ACTIVE", balance: { lte: LOW_BALANCE } },
        orderBy: { balance: "asc" },
        take: 6,
        select: { id: true, membershipNo: true, balance: true, customer: { select: { name: true } } },
      }),
      prisma.appointment.findMany({
        where: { deletedAt: null, status: "BOOKED", startAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
        take: 6,
        select: {
          id: true, startAt: true, status: true, customerName: true,
          customer: { select: { name: true } }, service: { select: { name: true } },
        },
      }),
    ]);

  const kpis: { label: string; value: string; icon: LucideIcon; href: string }[] = [
    { label: "Today's Revenue", value: formatINR(Number(revenueAgg._sum.amount ?? 0)), icon: IndianRupee, href: "/admin/billing-history" },
    { label: "Today's Invoices", value: String(invoiceCount), icon: Receipt, href: "/admin/billing-history" },
    { label: "Today's Appointments", value: String(apptCount), icon: CalendarDays, href: "/admin/appointments" },
    { label: "New Memberships", value: String(newMemberships), icon: Wallet, href: "/admin/memberships" },
  ];

  type InvoiceRow = (typeof recentInvoices)[number];
  const invoiceCols: Column<InvoiceRow>[] = [
    {
      key: "number",
      header: "Invoice",
      cell: (i) => (
        <Link href={`/admin/billing/${i.id}`} className={tableIdLinkClass}>
          {i.number}
        </Link>
      ),
    },
    { key: "customer", header: "Customer", cell: (i) => i.customer?.name ?? "Walk-in" },
    {
      key: "time",
      header: "Time",
      align: "right",
      hideOnMobile: true,
      cell: (i) => <span className="text-ink-muted">{formatTime(i.createdAt)}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (i) => <span className="font-medium">{formatINR(Number(i.grandTotal))}</span>,
    },
  ];

  type UpcomingRow = (typeof upcoming)[number];
  const upcomingCols: Column<UpcomingRow>[] = [
    { key: "when", header: "When", cell: (a) => formatSchedule(a.startAt) },
    {
      key: "customer",
      header: "Customer",
      cell: (a) => (
        <span className="font-medium">{a.customer?.name ?? a.customerName ?? "Walk-in"}</span>
      ),
    },
    {
      key: "service",
      header: "Service",
      hideOnMobile: true,
      cell: (a) => <span className="text-ink-muted">{a.service?.name ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (a) => <StatusChip tone={APPT_TONE[a.status]}>{a.status.replace("_", " ")}</StatusChip>,
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Good day, ${user.name?.split(" ")[0] ?? "there"}`}
        description="Today at a glance — revenue, bookings, and accounts that need attention."
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <Link key={k.label} href={k.href} className="block">
              <Panel className="h-full p-5 transition-colors duration-150 hover:border-gold-shadow">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-meta uppercase text-ink-muted">{k.label}</p>
                  <k.icon className="h-4 w-4 shrink-0 text-gold-shadow" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="mt-2 text-ui-title font-medium tabular-nums text-ink">
                  {k.value}
                </p>
              </Panel>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHeader
              title="Recent Invoices"
              actions={<ViewAll href="/admin/billing-history" label="invoices" />}
            />
            <DataTable
              caption="Most recent invoices"
              columns={invoiceCols}
              rows={recentInvoices}
              getRowKey={(i) => i.id}
              empty={
                <EmptyState
                  compact
                  icon={Receipt}
                  title="No invoices yet"
                  message="Ring up your first sale in Billing."
                />
              }
            />
          </Panel>

          <Panel>
            <PanelHeader title="Low Wallet Balances" />
            {lowBalances.length === 0 ? (
              <EmptyState
                compact
                icon={Wallet}
                title="All healthy"
                message={`No active memberships below ${formatINR(LOW_BALANCE)}.`}
              />
            ) : (
              <ul className="divide-y divide-warm-line/70">
                {lowBalances.map((m) => {
                  const balance = Number(m.balance);
                  return (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6"
                    >
                      <div className="min-w-0">
                        <Link href={`/admin/memberships/${m.id}`} className={tableLinkClass}>
                          {m.customer.name}
                        </Link>
                        <p className="mt-0.5 text-ui-sm text-ink-muted">{m.membershipNo}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-ui font-medium tabular-nums ${
                            balance <= 0 ? "text-danger" : "text-warning"
                          }`}
                        >
                          {formatINR(balance)}
                        </p>
                        <p className="mt-0.5 flex items-center justify-end gap-1 text-ui-sm text-ink-muted">
                          <TriangleAlert className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                          {balance <= 0 ? "Empty" : "Running low"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <Panel>
          <PanelHeader
            title="Upcoming Appointments"
            actions={<ViewAll href="/admin/appointments" label="appointments" />}
          />
          <DataTable
            caption="Upcoming booked appointments"
            columns={upcomingCols}
            rows={upcoming}
            getRowKey={(a) => a.id}
            empty={
              <EmptyState
                compact
                icon={CalendarDays}
                title="Nothing on the books"
                message="Booked appointments will appear here."
              />
            }
          />
        </Panel>
      </div>
    </div>
  );
}
