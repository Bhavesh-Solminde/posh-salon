"use client";

import { useRef, useState } from "react";
import { ActionButton } from "@/components/ui/Button";
import type { SiteContent } from "@/lib/site-content";

/** Roughly a screen of rows — enough to read the programme's range, short
 *  enough that the reveal button stays in view beneath it. */
const INITIAL = 12;

/**
 * The catalog runs past a hundred entries, which buried every section below it.
 * Rows past the first dozen are hidden rather than sliced out: `hidden` costs no
 * layout or paint, and it keeps every service name in the server-rendered HTML,
 * which is what the salon actually gets searched for.
 */
export function ServiceList({ services }: { services: SiteContent["services"] }) {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const collapsible = services.length > INITIAL;

  function toggle() {
    // Collapsing removes everything the reader was scrolled past, so send them
    // back to the top of the list instead of stranding them below the section.
    if (expanded) listRef.current?.scrollIntoView({ block: "start" });
    setExpanded((v) => !v);
  }

  return (
    <>
      {/* A printed programme, not a link list: the service pages don't
          exist yet, so these rows no longer pretend to lead anywhere. */}
      <ol
        id="service-list"
        ref={listRef}
        className="mt-12 scroll-mt-28 divide-y divide-warm-line border-y border-warm-line"
      >
        {services.map((service, i) => {
          const rowHidden = collapsible && !expanded && i >= INITIAL;
          return (
          <li
            key={service.id}
            // The attribute is what `divide-y` reads (`:not([hidden]) ~ :not([hidden])`),
            // so the row separators close up over the gap. It cannot do the hiding on
            // its own though: a `flex` utility outranks Preflight's `[hidden]` rule, so
            // the display utility is swapped rather than layered.
            hidden={rowHidden}
            className={`${rowHidden ? "hidden" : "flex"} items-baseline justify-between gap-6 py-6 sm:px-2`}
          >
            <span className="flex items-baseline gap-5 sm:gap-8">
              <span className="w-6 shrink-0 font-display text-sm italic text-gold-shadow">
                {service.no}
              </span>
              <span>
                <span className="block font-display text-xl text-ink sm:text-2xl">
                  {service.name}
                </span>
                {service.note && (
                  <span className="mt-1 block text-sm text-ink-muted">{service.note}</span>
                )}
              </span>
            </span>
            {service.category && (
              <span className="shrink-0 text-meta uppercase text-ink-muted">
                {service.category}
              </span>
            )}
          </li>
          );
        })}
      </ol>

      {collapsible && (
        <div className="mt-10 flex justify-center">
          <ActionButton
            variant="ghost"
            onClick={toggle}
            aria-expanded={expanded}
            aria-controls="service-list"
          >
            {expanded ? "Show less" : `Show all ${services.length} specialities`}
          </ActionButton>
        </div>
      )}
    </>
  );
}
