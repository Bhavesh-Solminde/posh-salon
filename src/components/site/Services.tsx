import { LinkButton } from "@/components/ui/Button";
import { ServiceList } from "@/components/site/ServiceList";
import type { SiteContent } from "@/lib/site-content";

export function Services({ services }: { services: SiteContent["services"] }) {
  const count = services.length;

  return (
    <section id="services" className="bg-warm-panel px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="font-display text-display-md italic text-ink">The Program.</h2>
          {count > 0 && (
            <p className="text-meta uppercase text-ink-muted">
              {count} {count === 1 ? "speciality" : "specialities"} · terms by
              consultation
            </p>
          )}
        </div>

        {count === 0 ? (
          <p className="mt-12 max-w-measure text-base leading-relaxed text-ink-muted">
            The programme is being set. Call the salon and the front desk will walk you
            through what is available today.
          </p>
        ) : (
          <>
            <ServiceList services={services} />

            <div className="mt-12">
              <LinkButton href="#reserve" variant="outline">
                Reserve a Visit
              </LinkButton>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
