import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PrintButton } from "@/components/admin/ui/PrintButton";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Invoice · ${BRAND_NAME}`,
  // Reachable only via a direct link sent to the customer, not for search indexes.
  robots: { index: false, follow: false },
};

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    <div className="print-page p-4 sm:p-6">
      <div className="mx-auto flex max-w-2xl justify-end pb-4 print:hidden">
        <PrintButton label="Print / Save as PDF" />
      </div>
      <InvoiceDocument invoice={invoice} settings={settings} />
    </div>
  );
}
