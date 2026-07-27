import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { PrintButton } from "@/components/admin/ui/PrintButton";
import { Seal } from "@/components/ui/Seal";
import { formatINR } from "@/lib/money";
import { formatDateTime } from "@/lib/format";

const TYPE_LABEL = {
  SERVICE: "Service",
  PRODUCT: "Product",
  MEMBERSHIP_TOPUP: "Top-up",
} as const;

export default async function InvoiceView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const [invoice, settings] = await Promise.all([
    prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: { items: true, payments: true, customer: true },
    }),
    prisma.settings.findUniqueOrThrow({ where: { id: "singleton" } }),
  ]);
  if (!invoice) notFound();

  return (
    <div>
      {/* Screen chrome only — the printed sheet is the client's document. */}
      <div className="print:hidden">
        <PageHeader
          back={{ href: "/admin/billing", label: "Back to billing" }}
          title={invoice.number}
          description={formatDateTime(invoice.createdAt)}
          status={
            <StatusChip
              tone={
                invoice.status === "PAID"
                  ? "success"
                  : invoice.status === "PARTIAL"
                    ? "warning"
                    : "neutral"
              }
            >
              {invoice.status}
            </StatusChip>
          }
          actions={<PrintButton label="Print invoice" />}
        />
      </div>

      <div className="print-page p-4 sm:p-6">
        {/* The invoice is the client's document: the maison voice belongs here,
            not in the tool chrome around it. */}
        <Panel className="print-sheet mx-auto max-w-2xl p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-warm-line pb-6">
            <div className="flex items-center gap-3">
              <Seal size="md" />
              <div>
                <p className="font-display text-ui-lg text-ink">{settings.salonName}</p>
                {settings.addressLine && (
                  <p className="text-ui-sm text-ink-muted">
                    {settings.addressLine}
                    {settings.city ? `, ${settings.city}` : ""}
                  </p>
                )}
                {settings.gstNumber && (
                  <p className="text-ui-sm text-ink-muted">GSTIN: {settings.gstNumber}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-ui-lg text-gold-shadow">{invoice.number}</p>
              <p className="text-ui-sm text-ink-muted">{formatDateTime(invoice.createdAt)}</p>
              <div className="mt-1.5">
                <StatusChip
                  tone={
                    invoice.status === "PAID"
                      ? "success"
                      : invoice.status === "PARTIAL"
                        ? "warning"
                        : "neutral"
                  }
                >
                  {invoice.status}
                </StatusChip>
              </div>
            </div>
          </div>

          {invoice.customer && (
            <p className="mt-4 text-ui-sm text-ink">
              Billed to <span className="font-medium">{invoice.customer.name}</span> ·{" "}
              <span className="tabular-nums">{invoice.customer.phone}</span>
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="mt-6 w-full border-collapse text-ui-sm">
              <caption className="sr-only">Invoice line items</caption>
              <thead>
                <tr className="border-b border-warm-line">
                  <th scope="col" className="py-2 text-left text-meta uppercase text-ink-muted">
                    Item
                  </th>
                  <th scope="col" className="py-2 text-right text-meta uppercase text-ink-muted">
                    Qty
                  </th>
                  <th scope="col" className="py-2 text-right text-meta uppercase text-ink-muted">
                    Price
                  </th>
                  <th scope="col" className="py-2 text-right text-meta uppercase text-ink-muted">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it) => (
                  <tr key={it.id} className="border-b border-warm-line/70">
                    <td className="py-2.5 pr-4 text-ink">
                      {it.name}
                      <span className="ml-2 text-ui-sm text-ink-muted">
                        {TYPE_LABEL[it.type as keyof typeof TYPE_LABEL] ?? it.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{it.quantity}</td>
                    <td className="py-2.5 text-right tabular-nums">
                      {formatINR(Number(it.unitPrice))}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {formatINR(Number(it.lineTotal))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto mt-6 max-w-xs space-y-1.5 text-ui-sm">
            <Line label="Services" value={formatINR(Number(invoice.serviceSubtotal))} />
            <Line label="Products" value={formatINR(Number(invoice.productSubtotal))} />
            {Number(invoice.discountTotal) > 0 && (
              <Line
                label="Discounts"
                value={`− ${formatINR(Number(invoice.discountTotal))}`}
              />
            )}
            <Line label="GST" value={formatINR(Number(invoice.taxTotal))} />
            <div className="border-t border-warm-line pt-1.5">
              <Line label="Grand Total" value={formatINR(Number(invoice.grandTotal))} strong />
            </div>
            {Number(invoice.walletRedeemed) > 0 && (
              <Line
                label="Wallet redeemed"
                value={`− ${formatINR(Number(invoice.walletRedeemed))}`}
              />
            )}
            <Line label="Paid" value={formatINR(Number(invoice.amountPaid))} />
            {Number(invoice.balanceDue) > 0 && (
              <Line label="Balance due" value={formatINR(Number(invoice.balanceDue))} strong />
            )}
          </div>

          {invoice.payments.length > 0 && (
            <p className="mt-6 text-ui-sm text-ink-muted">
              Paid via{" "}
              {invoice.payments
                .map((p) => `${p.method} ${formatINR(Number(p.amount))}`)
                .join(", ")}
            </p>
          )}
          <p className="mt-6 border-t border-warm-line pt-4 text-center text-meta uppercase text-ink-muted">
            Thank you for visiting {settings.salonName}
          </p>
        </Panel>
      </div>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className={strong ? "font-medium text-ink" : "text-ink-muted"}>{label}</span>
      <span className={`tabular-nums ${strong ? "font-medium text-ink" : "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}
