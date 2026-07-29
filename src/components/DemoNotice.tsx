"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The one piece of chrome that is not part of the product: a standing note that
 * this deployment is a demo on free hosting, so its cold starts are not what a
 * real build performs like.
 *
 * The site header is `fixed top-0`, so the bar cannot simply sit above it in
 * normal flow. Instead it publishes its own height as `--demo-bar-h` on the
 * document element; the header, the hero's keyline frame and the admin chrome
 * all offset off that variable. Dismissing sets the variable to 0px, which
 * snaps every consumer back to the top with no other conditional logic.
 */

const STORAGE_KEY = "sm-demo-notice";
const BAR_HEIGHT = "36px";

/** Runs in <head> before paint, so a returning visitor never sees the bar flash. */
export const demoNoticeNoFlashScript = `
try {
  if (localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) === "dismissed") {
    document.documentElement.style.setProperty("--demo-bar-h", "0px");
  }
} catch (e) {}
`;

export function DemoNotice() {
  // Starts hidden so the server-rendered markup matches the pre-paint script's
  // view of the world; the effect below decides within the first tick.
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "dismissed";
    } catch {
      // Private mode / storage disabled — show the notice, just don't remember.
    }
    setVisible(!dismissed);
    document.documentElement.style.setProperty(
      "--demo-bar-h",
      dismissed ? "0px" : BAR_HEIGHT,
    );
  }, []);

  // On a narrow phone the copy wraps and the bar is taller than the nominal
  // 36px, so publish what it actually measures rather than what we guessed.
  useEffect(() => {
    const el = barRef.current;
    if (!visible || !el) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--demo-bar-h",
        `${Math.round(el.getBoundingClientRect().height)}px`,
      );
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  function dismiss() {
    setVisible(false);
    document.documentElement.style.setProperty("--demo-bar-h", "0px");
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      // Nothing to do — the bar still closes for this visit.
    }
  }

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      role="note"
      className="fixed inset-x-0 top-0 z-[60] flex min-h-[36px] items-center justify-center gap-3 bg-ink px-10 py-2 text-center print:hidden"
    >
      <p className="text-meta uppercase leading-relaxed text-cream/90">
        Demo build — running on free hosting, so the first load is slow.{" "}
        <span className="text-gold-bright">Your website will not be.</span>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss demo notice"
        className="absolute right-3 flex h-6 w-6 shrink-0 items-center justify-center text-cream/60 transition-colors duration-200 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <span aria-hidden className="text-base leading-none">
          &times;
        </span>
      </button>
    </div>
  );
}
