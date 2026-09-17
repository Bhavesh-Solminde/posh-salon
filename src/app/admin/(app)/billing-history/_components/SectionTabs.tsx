import Link from "next/link";

const SECTIONS = [
  { key: "ledger", label: "Ledger", href: "/admin/billing-history" },
  { key: "bills", label: "Bills", href: "/admin/billing-history/bills" },
] as const;

/**
 * The two books kept under Billing History: the money ledger (every income and
 * expense line) and the bill register (every invoice, GST and non-GST).
 */
export function SectionTabs({ active }: { active: (typeof SECTIONS)[number]["key"] }) {
  return (
    <nav
      aria-label="Billing history sections"
      className="flex gap-6 border-b border-warm-line px-4 sm:px-6"
    >
      {SECTIONS.map((s) => {
        const on = s.key === active;
        return (
          <Link
            key={s.key}
            href={s.href}
            aria-current={on ? "page" : undefined}
            className={`-mb-px border-b-2 py-3 text-ui transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
              on
                ? "border-gold font-medium text-ink"
                : "border-transparent text-ink-muted hover:border-warm-line hover:text-ink"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
