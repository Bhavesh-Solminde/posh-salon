"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

type Tone = "success" | "danger" | "info";
type ToastItem = { id: number; message: string; tone: Tone };

const ToastCtx = createContext<{ toast: (message: string, tone?: Tone) => void }>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastCtx);
}

const TONE_CLASS: Record<Tone, string> = {
  success: "border-success bg-success-soft text-success",
  danger: "border-danger bg-danger-soft text-danger",
  info: "border-info bg-info-soft text-info",
};

// A failure needs longer than a confirmation — it usually asks for a decision.
const DURATION: Record<Tone, number> = { success: 3500, info: 4000, danger: 7000 };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((s) => s.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: Tone = "success") => {
      const id = Date.now() + Math.random();
      setItems((s) => [...s, { id, message, tone }]);
      timers.current.push(setTimeout(() => dismiss(id), DURATION[tone]));
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {/* One persistent live region: announcements land even though each toast
          is inserted after the fact. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col gap-2 print:hidden"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 border px-4 py-2.5 text-ui-sm shadow-card-lift motion-safe:animate-[fadeIn_180ms_ease-out] ${TONE_CLASS[t.tone]}`}
          >
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="-mr-1 shrink-0 opacity-70 transition-opacity duration-150 hover:opacity-100"
            >
              <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
