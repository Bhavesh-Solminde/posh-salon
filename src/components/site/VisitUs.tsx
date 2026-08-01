import { DeckleCard } from "@/components/ui/DeckleCard";
import { LinkButton } from "@/components/ui/Button";
import { isPlaceholder, type SiteContent } from "@/lib/site-content";

const SOCIALS = [
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "facebook", label: "Facebook" },
] as const;

export function VisitUs({ salon }: { salon: SiteContent["salon"] }) {
  return (
    <section id="visit" className="px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
        <DeckleCard className="flex flex-col justify-center p-8 sm:p-12">
          <h2 className="font-display text-2xl italic text-gold-shadow">Visit Us</h2>
          <dl className="mt-8 space-y-6 text-ink">
            <div>
              <dt className="text-meta uppercase text-ink-muted">Address</dt>
              <dd className="mt-1.5 text-base">
                {salon.hasAddress ? (
                  salon.fullAddress
                ) : (
                  <span className="text-ink-muted">
                    Address confirmed shortly — call ahead and we&rsquo;ll direct you.
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-meta uppercase text-ink-muted">Telephone</dt>
              <dd className="mt-1.5 text-base">
                {salon.hasPhone ? (
                  <a
                    href={salon.telHref!}
                    className="underline decoration-gold/50 underline-offset-4 transition-colors duration-300 hover:decoration-gold-shadow"
                  >
                    {salon.phone}
                  </a>
                ) : (
                  <span className="text-ink-muted">To be confirmed</span>
                )}
              </dd>
            </div>
            {salon.hasEmail && (
              <div>
                <dt className="text-meta uppercase text-ink-muted">Email</dt>
                <dd className="mt-1.5 text-base">
                  <a
                    href={`mailto:${salon.email}`}
                    className="underline decoration-gold/50 underline-offset-4 transition-colors duration-300 hover:decoration-gold-shadow"
                  >
                    {salon.email}
                  </a>
                </dd>
              </div>
            )}
            {salon.hours.length > 0 && (
              <div>
                <dt className="text-meta uppercase text-ink-muted">Hours</dt>
                <dd className="mt-1.5 space-y-1">
                  {salon.hours.map((h) => (
                    <div key={h.day} className="flex justify-between gap-6 text-sm">
                      <span className="text-ink/70">{h.day}</span>
                      <span className={isPlaceholder(h.time) ? "text-ink-muted" : ""}>
                        {isPlaceholder(h.time) ? "To be confirmed" : h.time}
                      </span>
                    </div>
                  ))}
                </dd>
              </div>
            )}
            {salon.hasSocial && (
              <div>
                <dt className="text-meta uppercase text-ink-muted">Follow</dt>
                <dd className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-base">
                  {SOCIALS.map((s, i) => (
                    <span key={s.label} className="flex items-center gap-3">
                      {i > 0 && (
                        <span aria-hidden className="text-ink-muted/60">
                          ·
                        </span>
                      )}
                      <a
                        href={salon.social[s.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-gold/50 underline-offset-4 transition-colors duration-300 hover:decoration-gold-shadow"
                      >
                        {s.label}
                      </a>
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </DeckleCard>

        {salon.hasAddress ? (
          <div className="flex flex-col">
            {salon.mapsEmbedUrl ? (
              // Keyless embed — the Maps Embed API needs a billable key. Lazy so
              // the map costs nothing until this far down the page is reached.
              <div className="relative min-h-[320px] flex-1 overflow-hidden border border-warm-line bg-warm-panel">
                <iframe
                  src={salon.mapsEmbedUrl}
                  title={`Map showing ${salon.name}, ${salon.city}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            ) : (
              // Staff pointed the address somewhere our pinned map doesn't cover.
              <div className="flex min-h-[320px] flex-1 items-center justify-center border border-warm-line bg-warm-panel px-8 text-center">
                <p className="max-w-measure text-base text-ink">{salon.fullAddress}</p>
              </div>
            )}
            <div className="mt-6 flex justify-center">
              <LinkButton
                href={salon.mapsHref!}
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
              </LinkButton>
            </div>
          </div>
        ) : (
          <div className="relative flex min-h-[320px] flex-col items-center justify-center border border-dashed border-warm-line bg-warm-panel px-8 text-center">
            <p className="text-sm text-ink-muted">
              Directions appear here once the salon&rsquo;s address is confirmed.
            </p>
            <span className="mt-5 inline-block border border-gold/40 px-6 py-3 text-meta uppercase text-ink-muted opacity-60">
              Get Directions
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
