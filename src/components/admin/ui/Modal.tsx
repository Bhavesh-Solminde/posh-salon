"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Centered dialog for create/edit forms. Focus-trapped, Esc-to-close,
 *  scroll-locked; overlay is fixed so it escapes any clipping ancestor. */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  /** Focus the dialog itself instead of its first field — for confirmations,
   *  where landing on the destructive control would be a trap. */
  autoFocusPanel = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg";
  autoFocusPanel?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    prevFocus.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (autoFocusPanel) panel?.focus();
    else panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !panel) return;
      const f = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      prevFocus.current?.focus();
    };
  }, [open, onClose, autoFocusPanel]);

  if (!open) return null;

  return (
    // `text-left` because a dialog opened from a right-aligned table cell would
    // otherwise inherit that alignment — these render in place, not in a portal.
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 text-left sm:p-8">
      {/* Scrim: a click target, not a control — the header's Close button is the
          announced way out, so this stays out of the accessibility tree. */}
      <div
        onClick={onClose}
        aria-hidden
        className="fixed inset-0 bg-ink/40 motion-safe:animate-[fadeIn_150ms_ease-out]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative my-auto w-full border border-warm-line bg-warm-white shadow-card-lift outline-none ${
          size === "lg" ? "max-w-3xl" : "max-w-lg"
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-warm-line px-6 py-4">
          <h2 id={titleId} className="text-ui-lg font-medium text-ink">
            {title}
          </h2>
          <AdminButton
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </AdminButton>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
