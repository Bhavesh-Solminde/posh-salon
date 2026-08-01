import { Seal } from "@/components/ui/Seal";
import type { SiteContent } from "@/lib/site-content";

const LINKS = [
  { label: "Services", href: "#services" },
  { label: "Membership", href: "#membership" },
  { label: "Gallery", href: "#gallery" },
  { label: "About", href: "#about" },
  { label: "Visit", href: "#visit" },
];

// Inline paths rather than an icon package — every mark on the public site is
// hand-rolled SVG (see WhatsAppFab), and lucide is an admin-only dependency.
const SOCIALS = [
  {
    key: "instagram",
    label: "Instagram",
    path: "M16 3c-3.53 0-3.97.015-5.36.078-1.384.064-2.33.284-3.157.607a6.37 6.37 0 0 0-2.303 1.5 6.37 6.37 0 0 0-1.5 2.302c-.322.827-.542 1.773-.606 3.157C3.015 12.03 3 12.47 3 16s.015 3.97.078 5.36c.064 1.383.284 2.329.606 3.156a6.37 6.37 0 0 0 1.5 2.303 6.37 6.37 0 0 0 2.303 1.5c.827.322 1.773.542 3.157.606C12.03 28.985 12.47 29 16 29s3.97-.015 5.36-.078c1.383-.064 2.329-.284 3.156-.606a6.37 6.37 0 0 0 2.303-1.5 6.37 6.37 0 0 0 1.5-2.303c.322-.827.542-1.773.606-3.157.063-1.389.078-1.829.078-5.359s-.015-3.97-.078-5.36c-.064-1.383-.284-2.329-.606-3.156a6.37 6.37 0 0 0-1.5-2.303 6.37 6.37 0 0 0-2.303-1.5c-.827-.322-1.773-.542-3.157-.606C19.97 3.015 19.53 3 16 3Zm0 2.343c3.47 0 3.878.014 5.25.076 1.267.058 1.955.27 2.413.448.607.236 1.04.518 1.495.972.454.455.736.888.972 1.495.178.458.39 1.146.448 2.413.062 1.372.076 1.78.076 5.253 0 3.47-.014 3.878-.076 5.25-.058 1.267-.27 1.955-.448 2.413a4.03 4.03 0 0 1-.972 1.495 4.03 4.03 0 0 1-1.495.972c-.458.178-1.146.39-2.413.448-1.372.062-1.78.076-5.25.076s-3.881-.014-5.253-.076c-1.267-.058-1.955-.27-2.413-.448a4.03 4.03 0 0 1-1.495-.972 4.03 4.03 0 0 1-.972-1.495c-.178-.458-.39-1.146-.448-2.413-.062-1.372-.076-1.78-.076-5.25s.014-3.881.076-5.253c.058-1.267.27-1.955.448-2.413.236-.607.518-1.04.972-1.495a4.03 4.03 0 0 1 1.495-.972c.458-.178 1.146-.39 2.413-.448 1.372-.062 1.78-.076 5.253-.076Zm0 3.981a6.676 6.676 0 1 0 0 13.352 6.676 6.676 0 0 0 0-13.352Zm0 11.009a4.333 4.333 0 1 1 0-8.666 4.333 4.333 0 0 1 0 8.666Zm8.502-11.273a1.56 1.56 0 1 1-3.12 0 1.56 1.56 0 0 1 3.12 0Z",
  },
  {
    key: "youtube",
    label: "YouTube",
    path: "M29.38 9.87a3.52 3.52 0 0 0-2.474-2.493C24.72 6.786 16 6.786 16 6.786s-8.72 0-10.906.59A3.52 3.52 0 0 0 2.62 9.87C2.034 12.07 2.034 16.66 2.034 16.66s0 4.59.586 6.79a3.52 3.52 0 0 0 2.474 2.454c2.186.59 10.906.59 10.906.59s8.72 0 10.906-.59a3.52 3.52 0 0 0 2.474-2.454c.586-2.2.586-6.79.586-6.79s0-4.59-.586-6.79ZM13.148 20.83v-8.34l7.288 4.17-7.288 4.17Z",
  },
  {
    key: "facebook",
    label: "Facebook",
    path: "M29 16.083C29 8.858 23.18 3 16 3S3 8.858 3 16.083C3 22.612 7.754 28.025 13.969 29V19.864h-3.3v-3.781h3.3v-2.88c0-3.278 1.942-5.089 4.913-5.089 1.423 0 2.912.256 2.912.256v3.22h-1.64c-1.615 0-2.119 1.009-2.119 2.043v2.45h3.607l-.577 3.781h-3.03V29C24.246 28.025 29 22.612 29 16.083Z",
  },
] as const;

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

        {salon.hasSocial && (
          <div className="mt-7 flex items-center gap-6 text-ink-muted">
            {SOCIALS.map((s) => (
              <a
                key={s.key}
                href={salon.social[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${salon.name} on ${s.label}`}
                className="transition-colors duration-300 hover:text-gold-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current" aria-hidden>
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        )}

        <p className="mt-10 text-sm text-ink-muted/70">
          &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
          {salon.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
