import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel, PanelHeader } from "@/components/admin/ui/Panel";
import { AdminButton } from "@/components/admin/AdminButton";
import { filterControlClass } from "@/components/admin/ui/FilterBar";
import { formatINR } from "@/lib/money";
import { formatDayMonth, formatISODate, toDateInput } from "@/lib/format";

const CAT_LABEL: Record<string, string> = {
  MEMBERSHIP_SALE: "Membership sales", PRODUCT_SALE: "Product sales", SERVICE_SALE: "Service sales",
  SUPPLIER_PURCHASE: "Supplier purchases", MISC_EXPENSE: "Misc expenses",
};

function monthStart() {
  const d = new Date();
  return toDateInput(new Date(d.getFullYear(), d.getMonth(), 1));
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireRole("MANAGER");
  const sp = await searchParams;
  const from = sp.from ?? monthStart();
  const to = sp.to ?? toDateInput(new Date());
  const gte = new Date(from + "T00:00:00");
  const lte = new Date(to + "T23:59:59");

  const [byCat, invoiceAgg, invoices, membershipCount] = await Promise.all([
    prisma.financialTransaction.groupBy({
      by: ["type", "category"],
      where: { deletedAt: null, occurredAt: { gte, lte } },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: { deletedAt: null, createdAt: { gte, lte } },
      _sum: { grandTotal: true, taxTotal: true, walletRedeemed: true },
      _count: true,
    }),
    prisma.invoice.findMany({
      where: { deletedAt: null, createdAt: { gte, lte } },
      select: { createdAt: true, grandTotal: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.membership.count({ where: { deletedAt: null, createdAt: { gte, lte } } }),
  ]);

  const income = byCat.filter((r) => r.type === "INCOME").reduce((s, r) => s + Number(r._sum.amount ?? 0), 0);
  const expense = byCat.filter((r) => r.type === "EXPENSE").reduce((s, r) => s + Number(r._sum.amount ?? 0), 0);
  const gst = Number(invoiceAgg._sum.taxTotal ?? 0);

  // Daily revenue buckets
  const daily = new Map<string, number>();
  for (const inv of invoices) {
    const key = formatDayMonth(inv.createdAt);
    daily.set(key, (daily.get(key) ?? 0) + Number(inv.grandTotal));
  }
  const bars = [...daily.entries()];
  const maxBar = Math.max(1, ...bars.map(([, v]) => v));

  const breakdown = [...byCat].sort(
    (a, b) => Number(b._sum.amount ?? 0) - Number(a._sum.amount ?? 0),
  );

  const kpis = [
    { label: "Revenue", value: formatINR(income) },
    { label: "Expenses", value: formatINR(expense) },
    { label: "Net", value: formatINR(income - expense) },
    { label: "Invoices", value: String(invoiceAgg._count) },
    { label: "GST collected", value: formatINR(gst) },
    { label: "New memberships", value: String(membershipCount) },
  ];

  const rangeLabel = `${formatISODate(from)} – ${formatISODate(to)}`;

  return (
    <div>
      <PageHeader
        title="Reports"
        description={`Sales, expenses, membership, and tax for ${rangeLabel}.`}
        actions={
          <>
            <form method="get" className="flex flex-wrap items-end gap-2">
              <div>
                <label htmlFor="report-from" className="text-meta uppercase text-ink-muted">
                  From
                </label>
                <div className="mt-1.5">
                  <input
                    id="report-from"
                    type="date"
                    name="from"
                    defaultValue={from}
                    className={filterControlClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="report-to" className="text-meta uppercase text-ink-muted">
                  To
                </label>
                <div className="mt-1.5">
                  <input
                    id="report-to"
                    type="date"
                    name="to"
                    defaultValue={to}
                    className={filterControlClass}
                  />
                </div>
              </div>
              <AdminButton type="submit" variant="secondary">
                Apply
              </AdminButton>
            </form>
            <Link
              href={`/admin/billing-history/export?from=${from}&to=${to}`}
              prefetch={false}
              download
            >
              <AdminButton variant="secondary">Export CSV</AdminButton>
            </Link>
          </>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((k) => (
            <Panel key={k.label} className="p-5">
              <p className="text-meta uppercase text-ink-muted">{k.label}</p>
              <p className="mt-1.5 text-ui-title font-medium tabular-nums text-ink">{k.value}</p>
            </Panel>
          ))}
        </div>

        <Panel>
          <PanelHeader title="Daily Revenue" description={rangeLabel} />
          {bars.length === 0 ? (
            <p className="px-4 py-8 text-center text-ui-sm text-ink-muted sm:px-6">
              No revenue in this period.
            </p>
          ) : (
            <div className="px-4 py-6 sm:px-6">
              {/* Bars are sized, not stretched: a single day is one column, not a
                  gold slab across the panel. */}
              <div className="overflow-x-auto">
                <div
                  className="flex h-[180px] items-end gap-3 border-b border-warm-line pb-0"
                  aria-hidden
                >
                  {bars.map(([label, v]) => (
                    <div
                      key={label}
                      className="flex h-full w-12 shrink-0 flex-col items-center justify-end gap-1.5"
                    >
                      <span className="text-ui-sm tabular-nums text-ink-muted">
                        {Math.round(v / 1000) >= 1 ? `${Math.round(v / 1000)}k` : Math.round(v)}
                      </span>
                      <div
                        className="w-full bg-gold"
                        style={{ height: `${Math.max(2, (v / maxBar) * 132)}px` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2" aria-hidden>
                  {bars.map(([label]) => (
                    <span
                      key={label}
                      className="w-12 shrink-0 text-center text-meta text-ink-muted"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              {/* The same figures, for anyone not reading the bars. */}
              <table className="sr-only">
                <caption>Daily revenue, {rangeLabel}</caption>
                <thead>
                  <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {bars.map(([label, v]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{formatINR(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Breakdown" description="Where the money came from and went." />
          {breakdown.length === 0 ? (
            <p className="px-4 py-8 text-center text-ui-sm text-ink-muted sm:px-6">
              No activity in this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-ui-sm">
                <caption className="sr-only">Income and expenses by category</caption>
                <thead>
                  <tr className="border-b border-warm-line">
                    <th scope="col" className="px-4 py-3 text-left text-meta uppercase text-ink-muted sm:px-6">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-meta uppercase text-ink-muted sm:px-6">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((r) => (
                    <tr key={`${r.type}-${r.category}`} className="border-b border-warm-line/70 last:border-0">
                      <td className="px-4 py-3 text-ink sm:px-6">
                        {CAT_LABEL[r.category] ?? r.category}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums sm:px-6">
                        <span
                          className={`font-medium ${r.type === "INCOME" ? "text-success" : "text-danger"}`}
                        >
                          {r.type === "INCOME" ? "+" : "−"}
                          {formatINR(Number(r._sum.amount ?? 0))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
