import { Seal } from "@/components/ui/Seal";
import type { SiteContent } from "@/lib/site-content";

const LINKS = [
  { label: "Services", href: "#services" },
  { label: "Membership", href: "#membership" },
  { label: "Gallery", href: "#gallery" },
  { label: "About", href: "#about" },
  { label: "Visit", href: "#visit" },
];

export function Footer({ salon }: { salon: SiteContent["salon"] }) {
  const contacts = [
    salon.hasPhone ? { label: "Call", href: salon.telHref! } : null,
    salon.hasWhatsapp ? { label: "WhatsApp", href: salon.whatsappHref! } : null,
    salon.hasEmail ? { label: "Email", href: `mailto:${salon.email}` } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="border-t border-warm-line bg-warm-white px-6 py-16 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <Seal size="sm" />
        <p className="mt-5 font-display text-xl italic text-ink">{salon.name}</p>
        <p className="mt-2 text-meta uppercase text-ink-muted">{salon.tagline}</p>

        <nav
          aria-label="Footer"
          className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-3"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-nav uppercase text-ink-muted transition-colors duration-300 hover:text-gold-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {contacts.length > 0 ? (
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-nav uppercase text-ink-muted">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="transition-colors duration-300 hover:text-gold-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                {c.label}
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-nav uppercase text-ink-muted">
            Contact details publishing shortly
          </p>
        )}

        <p className="mt-10 text-sm text-ink-muted/70">
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
          {salon.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
