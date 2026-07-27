import { Info, TriangleAlert, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

const TONES = {
  info: { className: "border-info/40 bg-info-soft text-info", Icon: Info },
  warning: { className: "border-warning/40 bg-warning-soft text-warning", Icon: TriangleAlert },
  danger: { className: "border-danger/40 bg-danger-soft text-danger", Icon: CircleAlert },
} as const;

/**
 * A standing condition on a screen — low stock, an expiring plan — as opposed to
 * a toast, which reports something the user just did. Hairline border, no fill
 * beyond the state's own soft tint.
 */
export function Notice({
  tone = "info",
  children,
  action,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
  action?: ReactNode;
}) {
  const { className, Icon } = TONES[tone];
  return (
    <div
      className={`flex flex-wrap items-center gap-3 border px-4 py-3 text-ui-sm ${className}`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="min-w-0 flex-1">{children}</span>
      {action}
    </div>
  );
}
