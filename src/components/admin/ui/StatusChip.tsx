import type { ReactNode } from "react";

export type ChipTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONES: Record<ChipTone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-warm-panel text-ink-muted",
};

/** Status mark — meaning by color AND label, never color alone. */
export function StatusChip({
  tone = "neutral",
  children,
}: {
  tone?: ChipTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-1 text-meta uppercase ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
