import { notFound } from "next/navigation";
import { Wallet } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel, PanelHeader } from "@/components/admin/ui/Panel";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { PrintButton } from "@/components/admin/ui/PrintButton";
import { WhatsAppSendButton } from "@/components/admin/ui/WhatsAppSendButton";
import { MembershipCardPanel } from "@/components/MembershipCardPanel";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { getOrigin } from "@/lib/url";
import { BRAND_NAME } from "@/lib/brand";

export default async function MembershipCard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const [m, origin] = await Promise.all([
    prisma.membership.findFirst({
      where: { id, deletedAt: null },
      include: { customer: true, plan: true, transactions: { orderBy: { createdAt: "desc" } } },
    }),
    getOrigin(),
  ]);
  if (!m) notFound();

  const whatsappMessage = `Hi ${m.customer.name}, here's your ${m.tier} membership card (${m.membershipNo}) from ${BRAND_NAME}. View it here: ${origin}/membership/${m.qrToken}`;

  return (
    <div>
      {/* Screen chrome only — the printed card is the client's. */}
      <div className="print:hidden">
        <PageHeader
          back={{ href: "/admin/memberships", label: "Back to memberships" }}
          title={m.membershipNo}
          description={`${m.customer.name} · ${m.plan.name}`}
          status={
            <StatusChip
              tone={
                m.status === "ACTIVE" ? "success" : m.status === "EXPIRED" ? "warning" : "danger"
              }
            >
              {m.status}
            </StatusChip>
          }
          actions={
            <>
              <WhatsAppSendButton phone={m.customer.phone} message={whatsappMessage} />
              <PrintButton label="Print card" />
            </>
          }
        />
      </div>

      <div className="print-page grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
        {/* The card itself — the artifact that goes to the client, so the
            maison voice (seal, didone) stays here even though the surrounding
            tool speaks in Inter. */}
        <MembershipCardPanel membership={m} />

        {/* Ledger */}
        <Panel className="print:hidden">
          <PanelHeader
            title="Wallet Ledger"
            description="Every credit and debit, in order. Balances are never overwritten."
          />
          {m.transactions.length === 0 ? (
            <EmptyState
              compact
              icon={Wallet}
              title="No wallet activity yet"
              message="The opening top-up and every service redemption will be listed here."
            />
          ) : (
            <ul className="divide-y divide-warm-line/70">
              {m.transactions.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-ui-sm sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="text-ink">{t.reason}</p>
                    <p className="mt-0.5 text-ink-muted">{formatDate(t.createdAt)}</p>
                  </div>
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
      </div>
    </div>
  );
}
