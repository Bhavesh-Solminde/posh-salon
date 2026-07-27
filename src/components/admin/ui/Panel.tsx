import type { ReactNode } from "react";

/** Sharp, hairline-bordered surface — the admin's default container. */
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    // `min-w-0` keeps a wide table inside its own scroll area instead of
    // stretching the grid column that holds the panel.
    <div className={`min-w-0 border border-warm-line bg-warm-white ${className}`}>
      {children}
    </div>
  );
}

/**
 * The header row every data panel shares: a subhead on the left, actions on the
 * right, one hairline below. Inter — Bodoni is reserved for the page title and
 * the rail wordmark (DESIGN.md, The Didone-Speaks Rule).
 */
export function PanelHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-warm-line px-4 py-4 sm:px-6">
      <div className="min-w-[12rem] flex-1">
        <h2 className="text-ui-lg font-medium text-ink">{title}</h2>
        {description && (
          <p className="mt-0.5 text-ui-sm text-ink-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
