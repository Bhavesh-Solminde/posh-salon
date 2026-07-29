"use client";

import { useEffect, useRef, useState } from "react";
import { Seal } from "@/components/ui/Seal";
import { LinkButton } from "@/components/ui/Button";
import type { SiteContent } from "@/lib/site-content";

const NAV = [
  { label: "Services", href: "#services" },
  { label: "Membership", href: "#membership" },
  { label: "Gallery", href: "#gallery" },
  { label: "About", href: "#about" },
  { label: "Visit", href: "#visit" },
];

export function Header({ salon }: { salon: SiteContent["salon"] }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // An open menu owns the phone screen: Esc closes it, focus stays inside, and
  // the page behind it doesn't scroll away underneath.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>("a[href], button");
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
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
    };
  }, [open]);

  // Without a confirmed number, "Call Now" is a button that cannot call. Send
  // the visitor to the reservation form rather than to nothing.
  const cta = salon.hasPhone
    ? { href: salon.telHref!, label: "Call Now" }
    : { href: "#reserve", label: "Reserve a Visit" };

  return (
    <header
      // Sits below the demo notice bar; the variable collapses to 0px once the
      // bar is dismissed, so the header returns to the top of the viewport.
      style={{ top: "var(--demo-bar-h, 0px)" }}
      className={`fixed inset-x-0 z-50 transition-colors duration-500 ${
        solid
          ? "bg-warm-white/95 shadow-[0_1px_0_0_rgba(199,162,75,0.25)] backdrop-saturate-150"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:px-10">
        <a
          href="#top"
          className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          aria-label={`${salon.name} — top of page`}
        >
          <Seal size="sm" />
          <span className="hidden font-display text-lg tracking-wide text-ink sm:inline">
            {salon.name}
          </span>
        </a>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-nav font-medium uppercase text-ink-muted transition-colors duration-300 hover:text-gold-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LinkButton href="/admin/dashboard" variant="outline" className="px-5 py-2.5 text-meta">
            Admin Dashboard
          </LinkButton>
          <LinkButton href={cta.href} variant="primary" className="px-5 py-2.5 text-meta">
            {cta.label}
          </LinkButton>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center text-ink md:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300 ${
                open ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-300 ${
                open ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav
          ref={panelRef}
          id="site-menu"
          className="border-t border-warm-line bg-warm-white px-6 py-6 md:hidden"
          aria-label="Primary"
        >
          <ul className="flex flex-col gap-5">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-nav uppercase text-ink-muted transition-colors duration-300 hover:text-gold-shadow"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <LinkButton
                href={cta.href}
                variant="primary"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                {cta.label}
              </LinkButton>
            </li>
            <li>
              <LinkButton
                href="/admin/dashboard"
                variant="outline"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Admin Dashboard
              </LinkButton>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
