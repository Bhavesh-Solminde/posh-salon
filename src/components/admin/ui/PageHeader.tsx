import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The one page-title band — used by list screens and detail screens alike, so a
 * record page keeps the chrome its list had. Bodoni appears here and in the rail
 * wordmark only (DESIGN.md, The Didone-Speaks Rule).
 */
export function PageHeader({
  title,
  description,
  actions,
  back,
  status,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** A back link above the title, for detail screens. */
  back?: { href: string; label: string };
  /** Inline mark beside the title — typically a status chip on a record page. */
  status?: ReactNode;
}) {
  return (
    <div className="border-b border-warm-line px-4 py-5 sm:px-6">
      {back && (
        <Link
          href={back.href}
          className="mb-2 inline-flex items-center gap-1.5 text-ui-sm text-ink-muted transition-colors duration-150 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="font-display text-ui-title text-ink">{title}</h1>
            {status}
          </div>
          {description && (
            <p className="mt-1 max-w-measure text-ui-sm text-ink-muted">
              {description}
            </p>
          )}
        </div>
        {/* `items-end` so a plain button lines up with the control row of an
            inline filter form rather than centring against its label. */}
        {actions && (
          <div className="flex flex-wrap items-end gap-2 sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
