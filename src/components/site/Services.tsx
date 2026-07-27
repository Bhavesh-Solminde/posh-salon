import { LinkButton } from "@/components/ui/Button";
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
            {/* A printed programme, not a link list: the service pages don't
                exist yet, so these rows no longer pretend to lead anywhere. */}
            <ol className="mt-12 divide-y divide-warm-line border-y border-warm-line">
              {services.map((service) => (
                <li
                  key={service.id}
                  className="flex items-baseline justify-between gap-6 py-6 sm:px-2"
                >
                  <span className="flex items-baseline gap-5 sm:gap-8">
                    <span className="w-6 shrink-0 font-display text-sm italic text-gold-shadow">
                      {service.no}
                    </span>
                    <span>
                      <span className="block font-display text-xl text-ink sm:text-2xl">
                        {service.name}
                      </span>
                      {service.note && (
                        <span className="mt-1 block text-sm text-ink-muted">
                          {service.note}
                        </span>
                      )}
                    </span>
                  </span>
                  {service.category && (
                    <span className="shrink-0 text-meta uppercase text-ink-muted">
                      {service.category}
                    </span>
                  )}
                </li>
              ))}
            </ol>

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
