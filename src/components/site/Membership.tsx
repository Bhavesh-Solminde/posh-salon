import { DeckleCard } from "@/components/ui/DeckleCard";
import { LinkButton } from "@/components/ui/Button";
import { MEMBERSHIP_FALLBACK, TIER_COPY } from "@/data/membership";
import type { SiteContent } from "@/lib/site-content";

export function Membership({
  plans,
  salon,
}: {
  plans: SiteContent["plans"];
  salon: SiteContent["salon"];
}) {
  // Tiers follow the salon's own active plans; the copy for each tier is ours.
  const tiers = plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    ...TIER_COPY[plan.tier],
  }));

  return (
    <section id="membership" className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-display-md italic text-ink">
            The Privilege Extended.
          </h2>
          <p className="mx-auto mt-5 max-w-measure text-base leading-relaxed text-ink-muted">
            Membership at {salon.name} is a wallet, not a discount code. Every rupee
            placed into it is held in your name and redeemed against services — never
            against retail products.
          </p>
        </div>

        {tiers.length === 0 ? (
          <p className="mx-auto mt-12 max-w-measure text-center text-base leading-relaxed text-ink-muted">
            {MEMBERSHIP_FALLBACK}
          </p>
        ) : (
          <div
            className={`mt-14 grid gap-6 sm:grid-cols-2 ${
              tiers.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {tiers.map((tier) => (
              <DeckleCard
                key={tier.id}
                className={`flex flex-col p-7 ${
                  tier.featured ? "lg:-translate-y-4 lg:shadow-card-lift" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-shadow/50 font-display text-lg italic text-gold-shadow">
                    {tier.mark}
                  </span>
                  {tier.featured && (
                    <span className="text-meta font-medium uppercase text-gold-shadow">
                      Most Extended
                    </span>
                  )}
                </div>

                <h3 className="mt-6 font-display text-2xl text-ink">{tier.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/75">
                  {tier.description}
                </p>

                {tier.example && (
                  <p className="mt-4 border-t border-ink/10 pt-4 text-sm italic text-ink-muted">
                    {tier.example}
                  </p>
                )}

                <p className="mt-5 text-meta uppercase text-ink-muted">
                  Final terms confirmed at consultation
                </p>
              </DeckleCard>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <LinkButton
            href={salon.hasWhatsapp ? salon.whatsappHref! : "#reserve"}
            variant="outline"
          >
            Enquire About Membership
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
