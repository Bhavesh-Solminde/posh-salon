import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { PrintButton } from "@/components/admin/ui/PrintButton";
import { WhatsAppSendButton } from "@/components/admin/ui/WhatsAppSendButton";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { formatINR } from "@/lib/money";
import { formatDateTime } from "@/lib/format";
import { getOrigin } from "@/lib/url";

export default async function InvoiceView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const [invoice, settings, origin] = await Promise.all([
    prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: { items: true, payments: true, customer: true },
    }),
    prisma.settings.findUniqueOrThrow({ where: { id: "singleton" } }),
    getOrigin(),
  ]);
  if (!invoice) notFound();

  const whatsappMessage = invoice.customer
    ? `Hi ${invoice.customer.name}, here's your invoice ${invoice.number} from ${settings.salonName} for ${formatINR(Number(invoice.grandTotal))}. View it here: ${origin}/invoice/${invoice.id}`
    : "";

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
          actions={
            <>
              {invoice.customer && (
                <WhatsAppSendButton phone={invoice.customer.phone} message={whatsappMessage} />
              )}
              <PrintButton label="Print invoice" />
            </>
          }
        />
      </div>

      <div className="print-page p-4 sm:p-6">
        {/* The invoice is the client's document: the maison voice belongs here,
            not in the tool chrome around it. */}
        <InvoiceDocument invoice={invoice} settings={settings} />
      </div>
    </div>
  );
}
