import type { Prisma } from "@prisma/client";
import QRCode from "qrcode";
import { Panel } from "@/components/admin/ui/Panel";
import { Seal } from "@/components/ui/Seal";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { PRODUCTION_ORIGIN } from "@/lib/url";

export type MembershipWithCard = Prisma.MembershipGetPayload<{
  include: { customer: true; plan: true };
}>;

/**
 * The membership card itself — the client's document. Shared by the staff-side
 * membership view and the public, unauthenticated share link sent over WhatsApp.
 */
export async function MembershipCardPanel({ membership }: { membership: MembershipWithCard }) {
  const qrSvg = await QRCode.toString(`${PRODUCTION_ORIGIN}/membership/${membership.qrToken}`, {
    type: "svg",
    margin: 0,
    color: { dark: "#1C160E", light: "#0000" },
  });

  return (
    <Panel className="print-sheet h-fit p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Seal size="md" />
          <div>
            <p className="font-display text-ui-lg text-ink">Posh Salon</p>
            <p className="text-meta uppercase text-ink-muted">{membership.tier} Membership</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-meta uppercase text-ink-muted">Member</p>
          <p className="mt-1 text-ui-lg text-ink">{membership.customer.name}</p>
          <p className="mt-4 text-meta uppercase text-ink-muted">Membership No.</p>
          <p className="mt-1 font-display text-ui-lg tracking-wide text-gold-shadow">
            {membership.membershipNo}
          </p>
          <p className="mt-4 text-meta uppercase text-ink-muted">Wallet Balance</p>
          <p className="mt-1 font-display text-ui-title tabular-nums text-ink">
            {formatINR(Number(membership.balance))}
          </p>
          <p className="mt-1 text-ui-sm text-ink-muted">Redeemable against services only</p>
        </div>
        <div
          role="img"
          aria-label={`QR code for membership ${membership.membershipNo}`}
          className="h-28 w-28 shrink-0"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      </div>

      <p className="mt-8 border-t border-warm-line pt-4 text-ui-sm text-ink-muted">
        {membership.plan.name} · expires{" "}
        {membership.expiresAt ? formatDate(membership.expiresAt) : "—"}
      </p>
    </Panel>
  );
}
