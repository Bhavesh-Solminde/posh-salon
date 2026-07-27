import Link from "next/link";
import { History } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminButton } from "@/components/admin/AdminButton";
import {
  FilterBar,
  FilterField,
  SearchInput,
  filterControlClass,
} from "@/components/admin/ui/FilterBar";
import { ExpenseModal } from "./_components/ExpenseModal";
import { buildWhere, loadLedger } from "./_lib";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/format";

type Row = Awaited<ReturnType<typeof loadLedger>>[number];

const CAT_LABEL: Record<string, string> = {
  MEMBERSHIP_SALE: "Membership", PRODUCT_SALE: "Product sale", SERVICE_SALE: "Service sale",
  SUPPLIER_PURCHASE: "Supplier", MISC_EXPENSE: "Misc",
};

export default async function BillingHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const f = { type: sp.type, category: sp.category, from: sp.from, to: sp.to, q: sp.q };
  const where = buildWhere(f);

  const [rows, income, expense] = await Promise.all([
    loadLedger(f),
    prisma.financialTransaction.aggregate({ where: { ...where, type: "INCOME" }, _sum: { amount: true } }),
    prisma.financialTransaction.aggregate({ where: { ...where, type: "EXPENSE" }, _sum: { amount: true } }),
  ]);
  const totalIncome = Number(income._sum.amount ?? 0);
  const totalExpense = Number(expense._sum.amount ?? 0);
  const net = totalIncome - totalExpense;

  const qs = new URLSearchParams(
    Object.entries(f).filter(([, v]) => v) as [string, string][],
  ).toString();

  const columns: Column<Row>[] = [
    {
      key: "date",
      header: "Date",
      cell: (r) => <span className="text-ink-muted">{formatDate(r.occurredAt)}</span>,
    },
    {
      key: "type",
      header: "Type",
      cell: (r) => (
        <StatusChip tone={r.type === "INCOME" ? "success" : "danger"}>{r.type}</StatusChip>
      ),
    },
    {
      key: "cat",
      header: "Category",
      hideOnMobile: true,
      cell: (r) => <StatusChip tone="neutral">{CAT_LABEL[r.category] ?? r.category}</StatusChip>,
    },
    {
      key: "desc",
      header: "Description",
      cell: (r) => r.description ?? <span className="text-ink-muted">—</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (r) => (
        <span className={`font-medium ${r.type === "INCOME" ? "text-success" : "text-danger"}`}>
          {r.type === "INCOME" ? "+" : "−"}
          {formatINR(Number(r.amount))}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Billing History"
        description="Every income and expense transaction. Filter, search, and export."
        actions={
          <>
            <ExpenseModal />
            {/* A real download: `prefetch={false}` keeps the router from
                fetching a CSV attachment, and `download` keeps the cashier on
                this screen instead of navigating to the file. */}
            <Link
              href={`/admin/billing-history/export${qs ? `?${qs}` : ""}`}
              prefetch={false}
              download
            >
              <AdminButton variant="secondary">Export CSV</AdminButton>
            </Link>
          </>
        }
      />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Income" value={formatINR(totalIncome)} className="text-success" />
          <SummaryCard label="Expense" value={formatINR(totalExpense)} className="text-danger" />
          <SummaryCard
            label="Net"
            value={formatINR(net)}
            className={net >= 0 ? "text-success" : "text-danger"}
          />
        </div>

        <Panel>
          <FilterBar clearHref={qs ? "/admin/billing-history" : null}>
            <FilterField label="Type" htmlFor="ledger-type">
              <select
                id="ledger-type"
                name="type"
                defaultValue={f.type ?? ""}
                className={filterControlClass}
              >
                <option value="">All</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </FilterField>
            <FilterField label="From" htmlFor="ledger-from">
              <input
                id="ledger-from"
                type="date"
                name="from"
                defaultValue={f.from ?? ""}
                className={filterControlClass}
              />
            </FilterField>
            <FilterField label="To" htmlFor="ledger-to">
              <input
                id="ledger-to"
                type="date"
                name="to"
                defaultValue={f.to ?? ""}
                className={filterControlClass}
              />
            </FilterField>
            <FilterField label="Search" htmlFor="ledger-q" grow>
              <SearchInput id="ledger-q" defaultValue={f.q ?? ""} placeholder="Description" />
            </FilterField>
          </FilterBar>
          <DataTable
            caption="Income and expense transactions"
            columns={columns}
            rows={rows}
            getRowKey={(r) => r.id}
            empty={
              qs ? (
                <EmptyState
                  icon={History}
                  title="No transactions match these filters"
                  message="Widen the date range or clear the filters to see the full ledger."
                />
              ) : (
                <EmptyState
                  icon={History}
                  title="No transactions"
                  message="Income and expenses will appear here as you bill customers and record costs."
                />
              )
            }
          />
        </Panel>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <Panel className="p-5">
      <p className="text-meta uppercase text-ink-muted">{label}</p>
      <p className={`mt-1.5 text-ui-title font-medium tabular-nums ${className}`}>{value}</p>
    </Panel>
  );
}
