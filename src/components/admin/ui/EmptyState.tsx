import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Honest empty state. `compact` is for empty states inside a side panel or a
 * short list, where the full-height version would leave a crater.
 */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 text-center ${
        compact ? "py-8" : "py-16"
      }`}
    >
      <div
        className={`flex items-center justify-center border border-warm-line bg-warm-panel text-gold-shadow ${
          compact ? "h-10 w-10" : "h-14 w-14"
        }`}
      >
        <Icon className={compact ? "h-5 w-5" : "h-6 w-6"} strokeWidth={1.5} aria-hidden />
      </div>
      <p className={`text-ink ${compact ? "mt-3 text-ui" : "mt-5 text-ui-lg"}`}>
        {title}
      </p>
      {message && (
        <p className="mt-1.5 max-w-sm text-ui-sm text-ink-muted">{message}</p>
      )}
      {action && <div className={compact ? "mt-4" : "mt-5"}>{action}</div>}
    </div>
  );
}
