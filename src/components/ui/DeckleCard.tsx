import type { ReactNode } from "react";

export function DeckleCard({
  children,
  className = "",
  tone = "cream",
}: {
  children: ReactNode;
  className?: string;
  tone?: "cream" | "plain";
}) {
  const surface =
    tone === "cream"
      ? "bg-warm-panel text-ink shadow-[0_4px_20px_-8px_rgba(28,22,14,0.08)]"
      : "bg-warm-white text-ink ring-1 ring-warm-line";
  return (
    <div className={`deckle grain relative overflow-hidden ${surface} ${className}`}>
      {children}
    </div>
  );
}
