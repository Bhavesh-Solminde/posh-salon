"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SearchableSelectOption = {
  id: string;
  label: string;
  disabled?: boolean;
};

/**
 * A type-to-filter combobox for the same job a native `<select>` does, without
 * making the admin scroll a 500-row dropdown to find one customer. Two modes:
 * - "value" (default): behaves like a controlled select — the chosen option's
 *   label stays visible, `value`/`onChange` mirror a normal select.
 * - "picker" (`clearOnSelect`): an "add to list" control (service/product
 *   pickers) — fires `onChange` then resets its own text so the next pick
 *   starts from an empty query, matching the old select-that-clears-itself.
 */
export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "Search…",
  clearOnSelect = false,
  className = "",
  "aria-label": ariaLabel,
}: {
  id?: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  clearOnSelect?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const selected = options.find((o) => o.id === value) ?? null;
  const displayValue = open ? query : (selected?.label ?? "");

  const filtered =
    query.trim().length === 0
      ? options
      : options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        rootRef.current &&
        !rootRef.current.contains(target) &&
        !(listRef.current && listRef.current.contains(target))
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // The listbox is portalled to <body> (so ancestor scroll containers, e.g. a
  // table's overflow-x-auto — which forces overflow-y: auto too — can't clip
  // it), so its position has to be tracked to the input manually.
  useLayoutEffect(() => {
    if (!open) return;
    function updateRect() {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.bottom, left: r.left, width: r.width });
    }
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  function pick(option: SearchableSelectOption) {
    if (option.disabled) return;
    onChange(option.id);
    setOpen(false);
    setQuery(clearOnSelect ? "" : option.label);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) pick(opt);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${inputId}-listbox`}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        className={className}
        placeholder={placeholder}
        value={displayValue}
        onFocus={() => {
          setOpen(true);
          setQuery("");
          setHighlight(0);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {open &&
        rect &&
        createPortal(
          <ul
            ref={listRef}
            id={`${inputId}-listbox`}
            role="listbox"
            style={{ top: rect.top, left: rect.left, width: rect.width }}
            className="fixed z-50 mt-1 max-h-64 overflow-auto border border-warm-line bg-warm-white shadow-md"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-ui-sm text-ink-muted">No matches.</li>
            ) : (
              filtered.map((o, i) => (
                <li
                  key={o.id}
                  role="option"
                  aria-selected={o.id === value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(o);
                  }}
                  className={`cursor-pointer px-3 py-2 text-ui-sm ${
                    o.disabled
                      ? "cursor-not-allowed text-ink-muted opacity-60"
                      : i === highlight
                        ? "bg-warm-panel text-ink"
                        : "text-ink hover:bg-warm-panel"
                  }`}
                >
                  {o.label}
                </li>
              ))
            )}
          </ul>,
          document.body,
        )}
    </div>
  );
}
