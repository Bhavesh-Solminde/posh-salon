const CLAUSES = [
  {
    mark: "a.",
    title: "Specialist treatments, held to one standard",
    body: "Hydra and Korean facials, bridal and HD makeup performed by artists who treat each as a specialism, not a menu line.",
  },
  {
    mark: "b.",
    title: "Membership as standing privilege",
    body: "A wallet held in your name, redeemable against services on every visit — not a coupon that expires unused.",
  },
  {
    mark: "c.",
    title: "An experience extended, not sold",
    body: "From arrival to invoice, the pace, the room, and the attention are set to match the occasion you came for.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-display text-display-md italic text-ink">
          The Particulars.
        </h2>
        <ul className="mt-12 divide-y divide-warm-line border-y border-warm-line">
          {CLAUSES.map((clause) => (
            <li
              key={clause.mark}
              className="grid gap-3 py-8 sm:grid-cols-[3.5rem_1fr] sm:gap-8"
            >
              <span aria-hidden className="font-display text-2xl italic text-gold-shadow">
                {clause.mark}
              </span>
              <div>
                <p className="text-base font-medium text-ink sm:text-lg">
                  {clause.title}
                </p>
                <p className="mt-2 max-w-measure text-base leading-relaxed text-ink-muted">
                  {clause.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
