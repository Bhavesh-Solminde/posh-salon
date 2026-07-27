import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { SettingsForm } from "./_components/SettingsForm";
import { PlansManager } from "./_components/PlansManager";

export default async function SettingsPage() {
  await requireRole("ADMIN");

  const [settings, plans] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "singleton" } }),
    prisma.membershipPlan.findMany({
      where: { deletedAt: null },
      orderBy: { price: "asc" },
    }),
  ]);

  const s = settings!;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Salon information, billing/tax, and membership plans. Values feed billing and the public site."
      />
      <div className="space-y-6 p-4 sm:p-6">
        <Panel>
          <SettingsForm
            settings={{
              salonName: s.salonName,
              tagline: s.tagline ?? "",
              addressLine: s.addressLine ?? "",
              city: s.city ?? "",
              phone: s.phone ?? "",
              whatsapp: s.whatsapp ?? "",
              email: s.email ?? "",
              gstNumber: s.gstNumber ?? "",
              gstRatePct: Number(s.gstRatePct),
              pricesIncludeGst: s.pricesIncludeGst,
              invoicePrefix: s.invoicePrefix,
            }}
          />
        </Panel>

        <Panel>
          <PlansManager
            plans={plans.map((p) => ({
              id: p.id,
              name: p.name,
              tier: p.tier,
              price: Number(p.price),
              validityDays: p.validityDays,
              bonusAmount: Number(p.bonusAmount),
              discountPct: Number(p.discountPct),
              isActive: p.isActive,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
