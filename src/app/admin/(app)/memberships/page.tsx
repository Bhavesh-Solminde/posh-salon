import Link from "next/link";
import { Wallet } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { DataTable, tableIdLinkClass, type Column } from "@/components/admin/ui/DataTable";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { MembershipCreate } from "./_components/MembershipCreate";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/format";

type Row = Awaited<ReturnType<typeof load>>[number];
async function load() {
  return prisma.membership.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { customer: true, plan: true },
  });
}

export default async function MembershipsPage() {
  await requireStaff();
  const [memberships, customers, plans] = await Promise.all([
    load(),
    prisma.customer.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, take: 500 }),
    prisma.membershipPlan.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { price: "asc" } }),
  ]);

  const createAction = (
    <MembershipCreate
      customers={customers.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
      plans={plans.map((p) => ({ id: p.id, name: p.name, price: Number(p.price), bonusAmount: Number(p.bonusAmount) }))}
    />
  );

  const columns: Column<Row>[] = [
    {
      key: "no",
      header: "Member No",
      cell: (m) => (
        <Link href={`/admin/memberships/${m.id}`} className={tableIdLinkClass}>
          {m.membershipNo}
        </Link>
      ),
    },
    { key: "customer", header: "Customer", cell: (m) => m.customer.name },
    {
      key: "tier",
      header: "Tier",
      hideOnMobile: true,
      cell: (m) => <StatusChip tone="neutral">{m.tier}</StatusChip>,
    },
    {
      key: "balance",
      header: "Wallet",
      align: "right",
      cell: (m) => <span className="font-medium">{formatINR(Number(m.balance))}</span>,
    },
    {
      key: "expires",
      header: "Expires",
      align: "right",
      hideOnMobile: true,
      cell: (m) => (
        <span className="text-ink-muted">
          {m.expiresAt ? formatDate(m.expiresAt) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (m) => (
        <StatusChip
          tone={m.status === "ACTIVE" ? "success" : m.status === "EXPIRED" ? "warning" : "danger"}
        >
          {m.status}
        </StatusChip>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Memberships"
        description="Wallet balances redeemable against services only. Create a membership to fund a customer's wallet."
        actions={createAction}
      />
      <div className="p-4 sm:p-6">
        <Panel>
          <DataTable
            caption="Memberships"
            columns={columns}
            rows={memberships}
            getRowKey={(m) => m.id}
            empty={
              <EmptyState
                icon={Wallet}
                title="No memberships yet"
                message="Create a membership to fund a customer's services-only wallet."
                action={createAction}
              />
            }
          />
        </Panel>
      </div>
    </div>
  );
}
