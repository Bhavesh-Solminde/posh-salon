import { LinkButton } from "@/components/ui/Button";
import type { SiteContent } from "@/lib/site-content";

/**
 * What the salon is running right now, straight from the Website section of the
 * admin. Renders nothing when there are no live offers, so the page never keeps
 * a hollow section open waiting for content.
 */
export function Offers({
  offers,
  salon,
}: {
  offers: SiteContent["offers"];
  salon: SiteContent["salon"];
}) {
  if (offers.length === 0) return null;

  return (
    <section id="offers" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="font-display text-display-md italic text-ink">This Season.</h2>
          <p className="text-meta uppercase text-ink-muted">Currently extended</p>
        </div>

        <ul className="mt-12 divide-y divide-warm-line border-y border-warm-line">
          {offers.map((offer) => (
            <li key={offer.id} className="flex flex-col gap-2 py-7 sm:flex-row sm:gap-8">
              {offer.badge && (
                <span className="order-2 shrink-0 self-start border border-gold/50 px-3 py-1 text-meta uppercase text-gold-shadow sm:order-none sm:w-40 sm:border-0 sm:px-0 sm:py-0 sm:pt-1.5 sm:text-right">
                  {offer.badge}
                </span>
              )}
              <div className={offer.badge ? "order-1 sm:order-none sm:flex-1" : "sm:flex-1"}>
                <p className="font-display text-xl text-ink sm:text-2xl">{offer.title}</p>
                {offer.description && (
                  <p className="mt-2 max-w-measure text-sm leading-relaxed text-ink-muted">
                    {offer.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <LinkButton
            href={salon.hasWhatsapp ? salon.whatsappHref! : "#reserve"}
            variant="outline"
          >
            Enquire About an Offer
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
