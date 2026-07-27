import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Receipt, Wallet } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel, PanelHeader } from "@/components/admin/ui/Panel";
import { StatusChip, type ChipTone } from "@/components/admin/ui/StatusChip";
import { DataTable, tableIdLinkClass, type Column } from "@/components/admin/ui/DataTable";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { formatINR } from "@/lib/money";
import { formatDate, formatSchedule } from "@/lib/format";

const APPT_TONE: Record<string, ChipTone> = {
  BOOKED: "info", COMPLETED: "success", NO_SHOW: "danger", CANCELLED: "danger",
};

export default async function CustomerProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const customer = await prisma.customer.findFirst({
    where: { id, deletedAt: null },
    include: {
      memberships: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { plan: true, transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
      },
      invoices: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 25,
      },
      appointments: {
        where: { deletedAt: null },
        orderBy: { startAt: "desc" },
        take: 10,
        include: { service: true },
      },
    },
  });
  if (!customer) notFound();

  const totalSpend = customer.invoices.reduce((s, i) => s + Number(i.grandTotal), 0);
  const membership = customer.memberships[0];

  const info: [string, string][] = [
    ["Phone", customer.phone],
    ["Email", customer.email ?? "—"],
    ["Gender", customer.gender ?? "—"],
    ["Birthday", customer.birthday ? formatDate(customer.birthday) : "—"],
    ["Anniversary", customer.anniversary ? formatDate(customer.anniversary) : "—"],
    ["Allergies", customer.allergies ?? "—"],
    ["Total spend", formatINR(totalSpend)],
    ["Visits", String(customer.invoices.length)],
  ];

  type InvoiceRow = (typeof customer.invoices)[number];
  const invoiceCols: Column<InvoiceRow>[] = [
    {
      key: "no",
      header: "Invoice",
      cell: (i) => (
        <Link href={`/admin/billing/${i.id}`} className={tableIdLinkClass}>
          {i.number}
        </Link>
      ),
    },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (i) => <span className="text-ink-muted">{formatDate(i.createdAt)}</span>,
    },
    { key: "total", header: "Total", align: "right", cell: (i) => formatINR(Number(i.grandTotal)) },
    {
      key: "wallet",
      header: "Wallet used",
      align: "right",
      hideOnMobile: true,
      cell: (i) =>
        Number(i.walletRedeemed) > 0 ? (
          <span className="text-success">− {formatINR(Number(i.walletRedeemed))}</span>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (i) => (
        <StatusChip
          tone={i.status === "PAID" ? "success" : i.status === "PARTIAL" ? "warning" : "neutral"}
        >
          {i.status}
        </StatusChip>
      ),
    },
  ];

  type ApptRow = (typeof customer.appointments)[number];
  const apptCols: Column<ApptRow>[] = [
    { key: "when", header: "When", cell: (a) => formatSchedule(a.startAt) },
    {
      key: "service",
      header: "Service",
      cell: (a) => a.service?.name ?? <span className="text-ink-muted">—</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (a) => (
        <StatusChip tone={APPT_TONE[a.status]}>{a.status.replace("_", " ")}</StatusChip>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        back={{ href: "/admin/customers", label: "Back to customers" }}
        title={customer.name}
        description={`${customer.phone} · registered ${formatDate(customer.createdAt)}`}
        status={
          membership ? (
            <StatusChip tone="neutral">
              {membership.tier} · {membership.membershipNo}
            </StatusChip>
          ) : undefined
        }
      />

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-3">
        <Panel className="h-fit p-5 sm:p-6 lg:col-span-1">
          <h2 className="text-meta uppercase text-ink-muted">Details</h2>
          <dl className="mt-4 space-y-3">
            {info.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 text-ui">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="text-right text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          {customer.notes && (
            <div className="mt-5 border-t border-warm-line pt-4">
              <p className="text-meta uppercase text-ink-muted">Notes</p>
              <p className="mt-1.5 text-ui-sm text-ink">{customer.notes}</p>
            </div>
          )}
        </Panel>

        <div className="space-y-6 lg:col-span-2">
          {membership ? (
            <Panel>
              <PanelHeader
                title="Membership Wallet"
                description={`${membership.plan.name} · expires ${
                  membership.expiresAt ? formatDate(membership.expiresAt) : "—"
                } · redeemable against services only`}
                actions={
                  <div className="text-right">
                    <p className="text-ui-title font-medium tabular-nums text-ink">
                      {formatINR(Number(membership.balance))}
                    </p>
                    <p className="text-meta uppercase text-ink-muted">Balance</p>
                  </div>
                }
              />
              {membership.transactions.length === 0 ? (
                <EmptyState
                  compact
                  icon={Wallet}
                  title="No wallet activity yet"
                  message="Top-ups and service redemptions will appear here."
                />
              ) : (
                <ul className="divide-y divide-warm-line/70">
                  {membership.transactions.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-4 px-4 py-2.5 text-ui-sm sm:px-6"
                    >
                      <span className="text-ink">{t.reason}</span>
                      <span
                        className={`shrink-0 tabular-nums ${
                          t.type === "CREDIT" ? "text-success" : "text-danger"
                        }`}
                      >
                        {t.type === "CREDIT" ? "+" : "−"}
                        {formatINR(Number(t.amount))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          ) : (
            <Panel>
              <PanelHeader title="Membership Wallet" />
              <EmptyState
                compact
                icon={Wallet}
                title="No membership"
                message="Create one from Memberships to fund a services-only wallet for this customer."
              />
            </Panel>
          )}

          <Panel>
            <PanelHeader title="Invoices" />
            <DataTable
              caption={`Invoices for ${customer.name}`}
              columns={invoiceCols}
              rows={customer.invoices}
              getRowKey={(i) => i.id}
              empty={
                <EmptyState
                  compact
                  icon={Receipt}
                  title="No invoices yet"
                  message="Bills for this customer will be listed here."
                />
              }
            />
          </Panel>

          <Panel>
            <PanelHeader title="Appointments" />
            <DataTable
              caption={`Appointments for ${customer.name}`}
              columns={apptCols}
              rows={customer.appointments}
              getRowKey={(a) => a.id}
              empty={
                <EmptyState
                  compact
                  icon={CalendarDays}
                  title="No appointments yet"
                  message="Past and upcoming bookings will be listed here."
                />
              }
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}
