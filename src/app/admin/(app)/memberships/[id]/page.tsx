import { notFound } from "next/navigation";
import { Wallet } from "lucide-react";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel, PanelHeader } from "@/components/admin/ui/Panel";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { PrintButton } from "@/components/admin/ui/PrintButton";
import { Seal } from "@/components/ui/Seal";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/format";

export default async function MembershipCard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const m = await prisma.membership.findFirst({
    where: { id, deletedAt: null },
    include: { customer: true, plan: true, transactions: { orderBy: { createdAt: "desc" } } },
  });
  if (!m) notFound();

  const qrSvg = await QRCode.toString(m.qrToken, {
    type: "svg",
    margin: 0,
    color: { dark: "#1C160E", light: "#0000" },
  });

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
          actions={<PrintButton label="Print card" />}
        />
      </div>

      <div className="print-page grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
        {/* The card itself — the artifact that goes to the client, so the
            maison voice (seal, didone) stays here even though the surrounding
            tool speaks in Inter. */}
        <Panel className="print-sheet h-fit p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Seal size="md" />
              <div>
                <p className="font-display text-ui-lg text-ink">Posh Salon</p>
                <p className="text-meta uppercase text-ink-muted">{m.tier} Membership</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-meta uppercase text-ink-muted">Member</p>
              <p className="mt-1 text-ui-lg text-ink">{m.customer.name}</p>
              <p className="mt-4 text-meta uppercase text-ink-muted">Membership No.</p>
              <p className="mt-1 font-display text-ui-lg tracking-wide text-gold-shadow">
                {m.membershipNo}
              </p>
              <p className="mt-4 text-meta uppercase text-ink-muted">Wallet Balance</p>
              <p className="mt-1 font-display text-ui-title tabular-nums text-ink">
                {formatINR(Number(m.balance))}
              </p>
              <p className="mt-1 text-ui-sm text-ink-muted">
                Redeemable against services only
              </p>
            </div>
            <div
              role="img"
              aria-label={`QR code for membership ${m.membershipNo}`}
              className="h-28 w-28 shrink-0"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>

          <p className="mt-8 border-t border-warm-line pt-4 text-ui-sm text-ink-muted">
            {m.plan.name} · expires {m.expiresAt ? formatDate(m.expiresAt) : "—"}
          </p>
        </Panel>

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
