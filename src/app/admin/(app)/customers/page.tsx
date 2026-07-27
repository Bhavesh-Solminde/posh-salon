import Link from "next/link";
import { Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { DataTable, tableLinkClass, type Column } from "@/components/admin/ui/DataTable";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { FilterBar, FilterField, SearchInput } from "@/components/admin/ui/FilterBar";
import { CustomerFormModal } from "./_components/CustomerFormModal";
import { deleteCustomer } from "./actions";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/format";

const PAGE_LIMIT = 100;

type Row = Awaited<ReturnType<typeof loadCustomers>>[number];

async function loadCustomers(q: string) {
  return prisma.customer.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { phone: { contains: q } },
              { memberships: { some: { membershipNo: q } } },
              { memberships: { some: { qrToken: q } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
    include: {
      memberships: {
        where: { deletedAt: null, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaff();
  const q = ((await searchParams).q ?? "").trim();
  const customers = await loadCustomers(q);

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Customer",
      cell: (c) => (
        <Link href={`/admin/customers/${c.id}`} className={tableLinkClass}>
          {c.name}
        </Link>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      cell: (c) => <span className="tabular-nums">{c.phone}</span>,
    },
    {
      key: "membership",
      header: "Membership",
      cell: (c) => {
        const m = c.memberships[0];
        if (!m) return <span className="text-ink-muted">—</span>;
        return (
          <span className="flex flex-wrap items-center gap-2">
            <StatusChip tone="neutral">{m.tier}</StatusChip>
            <span className="tabular-nums text-ink-muted">
              {formatINR(Number(m.balance))} wallet
            </span>
          </span>
        );
      },
    },
    {
      key: "registered",
      header: "Registered",
      align: "right",
      hideOnMobile: true,
      cell: (c) => <span className="text-ink-muted">{formatDate(c.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <CustomerFormModal
            customer={{
              id: c.id,
              name: c.name,
              phone: c.phone,
              email: c.email ?? "",
              gender: c.gender ?? "",
              birthday: c.birthday ? c.birthday.toISOString().slice(0, 10) : "",
              anniversary: c.anniversary ? c.anniversary.toISOString().slice(0, 10) : "",
              notes: c.notes ?? "",
              allergies: c.allergies ?? "",
            }}
          />
          <DeleteButton
            action={deleteCustomer.bind(null, c.id)}
            label={`Remove ${c.name}`}
            title="Remove customer"
            confirm={`Remove ${c.name} from the customer list?`}
          >
            Past invoices and wallet history stay in the ledger — only the customer
            record is hidden from search and billing.
          </DeleteButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Register walk-ins and search by name, phone, membership ID, or QR."
        actions={<CustomerFormModal />}
      />
      <div className="p-4 sm:p-6">
        <Panel>
          <FilterBar applyLabel="Search" clearHref={q ? "/admin/customers" : null}>
            <FilterField label="Find a customer" htmlFor="customer-q" grow>
              <SearchInput
                id="customer-q"
                defaultValue={q}
                placeholder="Name, phone, membership ID, or QR"
              />
            </FilterField>
          </FilterBar>
          <DataTable
            caption="Customers"
            columns={columns}
            rows={customers}
            getRowKey={(c) => c.id}
            empty={
              q ? (
                <EmptyState
                  icon={Users}
                  title={`No customers match “${q}”`}
                  message="Check the spelling, or register this person as a new customer."
                  action={<CustomerFormModal />}
                />
              ) : (
                <EmptyState
                  icon={Users}
                  title="No customers yet"
                  message="Register your first walk-in to start billing and memberships."
                  action={<CustomerFormModal />}
                />
              )
            }
          />
          {customers.length === PAGE_LIMIT && (
            <p className="border-t border-warm-line px-4 py-3 text-ui-sm text-ink-muted sm:px-6">
              Showing the {PAGE_LIMIT} most recent customers — search to narrow the list.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
