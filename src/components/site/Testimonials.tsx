import type { SiteContent } from "@/lib/site-content";

/**
 * Guest words, published from the Website section of the admin. Nothing is
 * written here — when the salon has published none, the section says so plainly
 * rather than filling the space with invented praise.
 */
export function Testimonials({
  testimonials,
}: {
  testimonials: SiteContent["testimonials"];
}) {
  if (testimonials.length === 0) {
    return (
      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <span aria-hidden className="font-display text-5xl italic text-gold-shadow">
            &ldquo;
          </span>
          <p className="mt-2 font-display text-xl italic text-ink sm:text-2xl">
            Guest reflections, arriving soon.
          </p>
          <p className="mx-auto mt-4 max-w-measure text-sm text-ink-muted">
            We only publish words our guests have actually written for us — this space
            is reserved until they do.
          </p>
        </div>
      </section>
    );
  }

  const single = testimonials.length === 1;

  return (
    <section className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span aria-hidden className="font-display text-5xl italic text-gold-shadow">
            &ldquo;
          </span>
          <h2 className="mt-1 font-display text-display-md italic text-ink">
            In Their Words.
          </h2>
        </div>

        {/* Ruled columns, the way a programme sets parallel notes — not three
            identical cards. */}
        <ul
          className={`mx-auto mt-14 grid gap-x-12 gap-y-10 divide-warm-line ${
            single
              ? "max-w-2xl"
              : testimonials.length === 2
                ? "sm:grid-cols-2 sm:divide-x"
                : "sm:grid-cols-2 sm:divide-x lg:grid-cols-3"
          }`}
        >
          {testimonials.map((t) => (
            <li key={t.id} className="flex flex-col sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <blockquote
                className={`flex-1 font-display italic text-ink ${
                  single ? "text-center text-2xl sm:text-3xl" : "text-xl"
                }`}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <p
                className={`mt-5 text-meta uppercase text-ink-muted ${
                  single ? "text-center" : ""
                }`}
              >
                {t.author}
                {t.role ? ` · ${t.role}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
