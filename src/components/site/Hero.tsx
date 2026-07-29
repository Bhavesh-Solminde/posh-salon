import { Seal } from "@/components/ui/Seal";
import { LinkButton } from "@/components/ui/Button";
import type { SiteContent } from "@/lib/site-content";

export function Hero({ salon }: { salon: SiteContent["salon"] }) {
  return (
    // On a phone the frame tucks closer to the edge (16px inner line) so the
    // hero copy keeps its own measure instead of being squeezed inward.
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-var(--demo-bar-h,0px))] items-center justify-center overflow-hidden bg-warm-white px-6 pb-20 pt-36 sm:px-14"
    >
      {/* Embossed keyline frame, echoing the card's inner border. It starts
          below the header rather than behind it: the header is the letterhead,
          this is the card laid under it. */}
      <div className="pointer-events-none absolute inset-x-3 bottom-5 top-[74px] border border-gold/35 sm:inset-x-8 sm:bottom-8 sm:top-[72px]" />
      <div className="pointer-events-none absolute inset-x-4 bottom-6 top-[78px] border border-gold/15 sm:inset-x-9 sm:bottom-9 sm:top-[76px]" />

      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        <Seal size="lg" animate className="mb-8" />

        <p className="mb-6 text-particulars font-medium uppercase text-gold-shadow">
          {salon.tagline}
        </p>

        {/* The break is authored at the width it works at; a phone gets to
            balance the three words itself. */}
        <h1 className="text-balance font-display text-display-xl italic text-ink">
          An Invitation,
          <br className="hidden sm:inline" />{" "}
          <span className="sm:whitespace-nowrap">Not an Appointment.</span>
        </h1>

        <p className="mt-7 max-w-measure text-balance text-base leading-relaxed text-ink-muted sm:text-lg">
          Signature facials, bridal and HD makeup, and hair artistry — extended to
          those who hold a place at {salon.name}. Membership included.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          {salon.hasPhone ? (
            <LinkButton href={salon.telHref!}>Call Now</LinkButton>
          ) : (
            <LinkButton href="#reserve">Reserve a Visit</LinkButton>
          )}
          {salon.hasWhatsapp && (
            <LinkButton href={salon.whatsappHref!} variant="outline">
              WhatsApp Us
            </LinkButton>
          )}
          <LinkButton href={salon.hasPhone ? "#reserve" : "#services"} variant="ghost">
            {salon.hasPhone ? "Book an Appointment" : "See the Programme"}
          </LinkButton>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gold/30" />
    </section>
  );
}
