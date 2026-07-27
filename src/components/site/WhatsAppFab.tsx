import type { SiteContent } from "@/lib/site-content";

const ICON = (
  <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current" aria-hidden>
    <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.35.64 4.55 1.86 6.5L4 29l7.66-1.8a11.94 11.94 0 0 0 4.36.82h.01C22.65 28.02 28 22.62 28 15.99 28 9.37 22.65 3 16.02 3Zm0 21.62h-.01a9.6 9.6 0 0 1-4.9-1.34l-.35-.21-3.63.86.86-3.55-.23-.36a9.55 9.55 0 0 1-1.5-5.06c0-5.3 4.34-9.63 9.66-9.63 2.58 0 5 1.01 6.82 2.83a9.55 9.55 0 0 1 2.82 6.8c0 5.31-4.33 9.66-9.54 9.66Zm5.28-7.22c-.29-.15-1.7-.84-1.96-.93-.26-.1-.46-.15-.65.14-.19.29-.75.93-.92 1.13-.17.19-.34.22-.63.07-.29-.14-1.21-.44-2.31-1.42a8.63 8.63 0 0 1-1.6-1.98c-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.5.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5h-.56c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38 0 1.4 1.02 2.76 1.16 2.95.14.19 2 3.05 4.85 4.28.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.11.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34Z" />
  </svg>
);

/**
 * Only appears once the salon has published a WhatsApp number — a permanently
 * disabled floating button is furniture, not an affordance.
 */
export function WhatsAppFab({ salon }: { salon: SiteContent["salon"] }) {
  if (!salon.hasWhatsapp) return null;

  return (
    <a
      href={salon.whatsappHref!}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Message ${salon.name} on WhatsApp`}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-gold/70 bg-warm-white text-gold-shadow shadow-seal transition-transform duration-300 hover:-translate-y-1 hover:bg-gold hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
    >
      {ICON}
    </a>
  );
}
