import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { DataTable, tableEdgeClass, type Column } from "@/components/admin/ui/DataTable";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { adminButtonClass } from "@/components/admin/AdminButton";
import { TableSkeleton, Skeleton } from "@/components/admin/ui/Skeleton";
import {
  FilterBar,
  FilterField,
  SearchInput,
  filterControlClass,
} from "@/components/admin/ui/FilterBar";
import { SectionTabs } from "../_components/SectionTabs";
import {
  countBills,
  currentMonth,
  loadRegister,
  monthLabel,
  parseMonth,
  parseView,
  registerTotals,
  shiftMonth,
  type RegisterRow,
  type RegisterView,
} from "./_lib";
import { formatINR } from "@/lib/money";
import { formatDayMonth, formatTime } from "@/lib/format";

const BASE = "/admin/billing-history/bills";

function href(p: { month: string; view: RegisterView; q?: string }) {
  const qs = new URLSearchParams({ month: p.month, view: p.view });
  if (p.q) qs.set("q", p.q);
  return `${BASE}?${qs}`;
}

export default async function BillsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const month = parseMonth(sp.month);
  const view = parseView(sp.view);
  const q = sp.q?.trim() || undefined;

  const exportQs = new URLSearchParams({ month, view }).toString();

  return (
    <div>
      <PageHeader
        title="Billing History"
        description="Every bill issued, month by month — GST bills and non-GST bills kept as separate, numbered registers."
        actions={
          <Link
            href={`${BASE}/export?${exportQs}`}
            prefetch={false}
            download
            className={adminButtonClass({ variant: "secondary" })}
          >
            Export {view === "gst" ? "GST" : "non-GST"} register
          </Link>
        }
      />
      <SectionTabs active="bills" />
      <div className="p-4 sm:p-6">
        <Panel>
          {/* The bar renders at once; only the two tab counts wait on the DB. */}
          <Suspense key={month} fallback={<MonthBar month={month} view={view} />}>
            <CountedMonthBar month={month} view={view} />
          </Suspense>
          <FilterBar applyLabel="Show" clearHref={q ? href({ month, view }) : null}>
            <input type="hidden" name="view" value={view} />
            <FilterField label="Month" htmlFor="bills-month">
              <input
                id="bills-month"
                type="month"
                name="month"
                defaultValue={month}
                max={currentMonth()}
                className={filterControlClass}
              />
            </FilterField>
            <FilterField label="Search" htmlFor="bills-q" grow>
              <SearchInput
                id="bills-q"
                defaultValue={q ?? ""}
                placeholder="Bill number, customer name or phone"
              />
            </FilterField>
          </FilterBar>
          {/* Keyed on the query so switching tab/month shows the skeleton
              instead of the previous register lingering. */}
          <Suspense key={`${month}-${view}-${q ?? ""}`} fallback={<RegisterFallback />}>
            <Register month={month} view={view} q={q} />
          </Suspense>
        </Panel>
      </div>
    </div>
  );
}

async function CountedMonthBar({ month, view }: { month: string; view: RegisterView }) {
  return <MonthBar month={month} view={view} counts={await countBills(month)} />;
}

/** Month stepper + the GST / non-GST switch — the register's letterhead. */
function MonthBar({
  month,
  view,
  counts,
}: {
  month: string;
  view: RegisterView;
  counts?: { gst: number; nonGst: number };
}) {
  const isCurrent = month >= currentMonth();
  const stepClass =
    "flex h-9 w-9 items-center justify-center border border-warm-line text-ink-muted transition-colors duration-150 hover:bg-warm-panel hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

  const tabs: { key: RegisterView; label: string; count?: number }[] = [
    { key: "gst", label: "GST bills", count: counts?.gst },
    { key: "non-gst", label: "Non-GST bills", count: counts?.nonGst },
  ];

  return (
    <div className="flex flex-col gap-4 border-b border-warm-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-2">
        <Link
          href={href({ month: shiftMonth(month, -1), view })}
          aria-label={`Previous month, ${monthLabel(shiftMonth(month, -1))}`}
          className={stepClass}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </Link>
        <h2 className="min-w-[10.5rem] text-center text-ui-lg text-ink" aria-live="polite">
          {monthLabel(month)}
        </h2>
        {isCurrent ? (
          <span aria-hidden className={`${stepClass} pointer-events-none opacity-40`}>
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </span>
        ) : (
          <Link
            href={href({ month: shiftMonth(month, 1), view })}
            aria-label={`Next month, ${monthLabel(shiftMonth(month, 1))}`}
            className={stepClass}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
        )}
      </div>

      <nav aria-label="Bill register" className="grid grid-cols-2 border border-warm-line sm:flex">
        {tabs.map((t) => {
          const on = t.key === view;
          return (
            <Link
              key={t.key}
              href={href({ month, view: t.key })}
              aria-current={on ? "page" : undefined}
              className={`flex h-9 items-center justify-center gap-2 px-4 text-ui-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold ${
                on ? "bg-ink text-warm-white" : "text-ink-muted hover:bg-warm-panel hover:text-ink"
              }`}
            >
              {t.label}
              <span
                className={`min-w-[1.5rem] px-1 text-center text-ui-sm tabular-nums ${
                  on ? "text-gold-bright" : "text-gold-shadow"
                }`}
              >
                {t.count ?? ""}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function RegisterFallback() {
  return (
    <>
      <div className="border-b border-warm-line px-4 py-4 sm:px-6">
        <Skeleton className="h-4 w-64" />
      </div>
      <TableSkeleton />
    </>
  );
}

const money = (n: number) => formatINR(n);

function StatusMark({ status }: { status: RegisterRow["status"] }) {
  if (status === "PAID") return <StatusChip tone="success">Paid</StatusChip>;
  if (status === "PARTIAL") return <StatusChip tone="warning">Part-paid</StatusChip>;
  return <StatusChip tone="neutral">Void</StatusChip>;
}

async function Register({ month, view, q }: { month: string; view: RegisterView; q?: string }) {
  const { rows, monthCount } = await loadRegister(month, view, q);
  const t = registerTotals(rows);
  const isGst = view === "gst";
  const kind = isGst ? "GST" : "non-GST";

  // Void bills keep their place in the register but read as struck through.
  const amt = (r: RegisterRow, n: number) => (
    <span className={r.status === "VOID" ? "text-ink-muted line-through" : undefined}>
      {money(n)}
    </span>
  );

  const lead: Column<RegisterRow>[] = [
    {
      key: "serial",
      header: "No.",
      align: "right",
      cell: (r) => <span className="font-medium text-gold-shadow">{r.serial}</span>,
    },
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      cell: (r) => (
        <span className="whitespace-nowrap text-ink-muted">
          {formatDayMonth(r.date)}
          <span className="ml-1.5 hidden text-ink-muted/80 md:inline">{formatTime(r.date)}</span>
        </span>
      ),
    },
    {
      key: "bill",
      header: "Bill no.",
      cell: (r) => (
        <>
          <Link
            href={`/admin/billing/${r.id}`}
            className="whitespace-nowrap font-medium text-ink underline decoration-gold/40 underline-offset-4 transition-colors duration-150 hover:decoration-gold"
          >
            {r.number}
          </Link>
          {/* On a phone the date column hides and folds in here instead. */}
          <span className="mt-0.5 block text-ink-muted sm:hidden">{formatDayMonth(r.date)}</span>
        </>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      hideOnMobile: true,
      cell: (r) =>
        r.customer ? (
          <div className="min-w-0">
            <p className="truncate">{r.customer}</p>
            {r.phone && <p className="text-ink-muted">{r.phone}</p>}
          </div>
        ) : (
          <span className="text-ink-muted">Walk-in</span>
        ),
    },
  ];

  const moneyCols: Column<RegisterRow>[] = isGst
    ? [
        { key: "taxable", header: "Taxable value", align: "right", hideOnMobile: true, cell: (r) => amt(r, r.taxable) },
        { key: "cgst", header: "CGST", align: "right", hideOnMobile: true, cell: (r) => amt(r, r.cgst) },
        { key: "sgst", header: "SGST", align: "right", hideOnMobile: true, cell: (r) => amt(r, r.sgst) },
        { key: "total", header: "Bill total", align: "right", cell: (r) => <span className="font-medium">{amt(r, r.total)}</span> },
      ]
    : [
        {
          key: "method",
          header: "Paid by",
          hideOnMobile: true,
          cell: (r) => (r.method ? <StatusChip>{r.method}</StatusChip> : <span className="text-ink-muted">—</span>),
        },
        { key: "due", header: "Due", align: "right", hideOnMobile: true, cell: (r) => (r.due > 0 ? <span className="text-warning">{money(r.due)}</span> : <span className="text-ink-muted">—</span>) },
        { key: "total", header: "Bill total", align: "right", cell: (r) => <span className="font-medium">{amt(r, r.total)}</span> },
      ];

  const columns = [
    ...lead,
    ...moneyCols,
    { key: "status", header: "Status", hideOnMobile: true, cell: (r: RegisterRow) => <StatusMark status={r.status} /> },
  ];

  // The closing line of the register: labelled across the lead columns, then
  // one total per money column, under the ledger's double rule.
  const footCell = `px-4 py-3.5 text-right tabular-nums font-medium text-ink ${tableEdgeClass}`;
  const footLabel = q ? `Total of ${t.count} matching` : `Month total · ${t.count} ${t.count === 1 ? "bill" : "bills"}`;
  const foot = (
    <tr className="border-t-[3px] border-double border-gold">
      {/* Phone: No. / Bill no. show; tablet up adds Date and Customer. */}
      <th scope="row" colSpan={2} className={`px-4 py-3.5 text-left text-meta uppercase text-ink-muted sm:hidden ${tableEdgeClass}`}>
        {footLabel}
      </th>
      <th scope="row" colSpan={4} className={`hidden px-4 py-3.5 text-left text-meta uppercase text-ink-muted sm:table-cell ${tableEdgeClass}`}>
        {footLabel}
        {t.voided > 0 && <span className="ml-2 normal-case tracking-normal">({t.voided} void excluded)</span>}
      </th>
      {isGst ? (
        <>
          <td className={`hidden sm:table-cell ${footCell}`}>{money(t.taxable)}</td>
          <td className={`hidden sm:table-cell ${footCell}`}>{money(t.cgst)}</td>
          <td className={`hidden sm:table-cell ${footCell}`}>{money(t.sgst)}</td>
        </>
      ) : (
        <>
          <td className="hidden sm:table-cell" />
          <td className={`hidden sm:table-cell ${footCell} ${t.due > 0 ? "text-warning" : ""}`}>
            {t.due > 0 ? money(t.due) : "—"}
          </td>
        </>
      )}
      <td className={`${footCell} text-ui`}>{money(t.total)}</td>
      <td className="hidden sm:table-cell" />
    </tr>
  );

  const monthName = monthLabel(month);

  return (
    <>
      <p className="border-b border-warm-line px-4 py-3 text-ui-sm text-ink-muted sm:px-6">
        {isGst ? (
          <>
            <span className="text-ink">{t.count}</span> GST {t.count === 1 ? "bill" : "bills"} ·{" "}
            <span className="text-ink tabular-nums">{money(t.total)}</span> billed · GST collected{" "}
            <span className="text-ink tabular-nums">{money(t.tax)}</span>
          </>
        ) : (
          <>
            <span className="text-ink">{t.count}</span> non-GST {t.count === 1 ? "bill" : "bills"} ·{" "}
            <span className="text-ink tabular-nums">{money(t.total)}</span> billed
            {t.due > 0 && (
              <>
                {" "}· <span className="text-warning tabular-nums">{money(t.due)}</span> still due
              </>
            )}
          </>
        )}
        {q && <> — showing matches for “{q}” out of {monthCount}</>}
      </p>
      <DataTable
        caption={`${kind} bills for ${monthName}`}
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        foot={rows.length > 0 ? foot : undefined}
        empty={
          q ? (
            <EmptyState
              icon={FileText}
              title={`No ${kind} bill matches “${q}”`}
              message="Check the bill number or phone, or clear the search to see the whole month."
            />
          ) : (
            <EmptyState
              icon={FileText}
              title={`No ${kind} bills in ${monthName}`}
              message={
                isGst
                  ? "Bills generated with GST switched on are listed here, numbered in the order they were issued."
                  : "Bills generated with GST switched off are listed here, numbered in the order they were issued."
              }
            />
          )
        }
      />
    </>
  );
}
