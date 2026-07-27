import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap px-7 py-3.5 text-[0.7rem] font-body font-medium uppercase tracking-widest2 transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-gold text-ink shadow-emboss hover:bg-gold-bright hover:-translate-y-px active:translate-y-0 active:shadow-none",
  outline:
    "border border-gold text-ink hover:border-gold hover:bg-gold hover:text-ink",
  ghost:
    "px-0 py-0 uppercase tracking-widest2 text-[0.7rem] text-ink-muted underline decoration-gold/60 underline-offset-8 hover:text-ink hover:decoration-gold",
} as const;

type Variant = keyof typeof variants;

export function LinkButton({
  href,
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  // "#" is the sentinel for contact details the salon hasn't supplied yet —
  // render inert rather than as a live link that scroll-jumps to the top.
  if (href === "#") {
    return (
      <span
        aria-disabled="true"
        title="Available once the salon confirms this contact detail"
        className={`${base} ${variants[variant]} cursor-not-allowed opacity-50 ${className}`}
      >
        {children}
      </span>
    );
  }
  return (
    <a href={href} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </a>
  );
}

export function ActionButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
