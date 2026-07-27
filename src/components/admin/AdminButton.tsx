import type { ButtonHTMLAttributes, ReactNode } from "react";

// The admin's button vocabulary — compact, sharp, Inter, 150ms state-only
// transitions. Distinct from the landing's expressive embossed Button so the
// tool stays quiet (per operate.md). Semantic `danger` for destructive actions.
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border font-body font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "border-gold bg-gold text-ink hover:bg-gold-bright hover:border-gold-bright",
  secondary: "border-warm-line bg-warm-white text-ink hover:bg-warm-panel",
  ghost: "border-transparent text-ink-muted hover:bg-warm-line/40 hover:text-ink",
  danger: "border-danger bg-danger text-warm-white hover:opacity-90",
} as const;

const sizes = {
  // `lg` is the committing action at the end of a flow (Generate Invoice).
  lg: "h-11 px-5 text-ui",
  md: "h-9 px-4 text-ui-sm",
  icon: "h-9 w-9 shrink-0",
} as const;

export function AdminButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...rest
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
