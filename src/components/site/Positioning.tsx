import { DeckleCard } from "@/components/ui/DeckleCard";
import { BRAND_NAME } from "@/lib/brand";

export function Positioning() {
  return (
    <section id="about" className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <DeckleCard className="grid gap-10 p-8 sm:p-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:p-16">
          <div className="flex flex-col justify-center">
            <p className="font-display text-2xl italic text-gold-shadow sm:text-3xl">
              The Occasion
            </p>
            <h2 className="mt-4 font-display text-display-md italic text-ink">
              A salon built around the treatments worth a special trip.
            </h2>
            <p className="mt-6 max-w-measure text-base leading-relaxed text-ink/80">
              {BRAND_NAME} centres on our signature specialities — Hydra Facial, Korean
              Facial, and bridal &amp; HD makeup — delivered at a standard that treats
              your visit as an occasion, not a slot on a schedule. Membership here
              is not a punch-card discount; it is a standing wallet of value, held for
              you, extended each time you return.
            </p>
          </div>
          <div className="relative flex min-h-[240px] items-center justify-center border border-ink/15 bg-ink/[0.04] sm:min-h-[320px]">
            <p className="px-8 text-center text-meta uppercase text-ink-muted">
              Sample interior — awaiting the salon&rsquo;s own photography
            </p>
          </div>
        </DeckleCard>
      </div>
    </section>
  );
}
