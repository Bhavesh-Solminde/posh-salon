import Link from "next/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { AdminButton } from "@/components/admin/AdminButton";

/**
 * The GET-filter row shared by the list screens. Every screen had grown its own
 * version of this — different label sizes, hand-rolled submit buttons, and a
 * "Clear" that appeared in three different places. One bar, one register.
 */
export function FilterBar({
  children,
  applyLabel = "Apply",
  clearHref,
}: {
  children: ReactNode;
  applyLabel?: string;
  /** Shown only when a filter is active. */
  clearHref?: string | null;
}) {
  return (
    <form
      method="get"
      className="flex flex-wrap items-end gap-3 border-b border-warm-line px-4 py-4 sm:px-6"
    >
      {children}
      <AdminButton type="submit" variant="secondary">
        {applyLabel}
      </AdminButton>
      {clearHref && (
        <Link
          href={clearHref}
          className="flex h-9 items-center px-2 text-ui-sm text-ink-muted transition-colors duration-150 hover:text-ink"
        >
          Clear
        </Link>
      )}
    </form>
  );
}

/** A labelled control inside a FilterBar. */
export function FilterField({
  label,
  htmlFor,
  children,
  grow = false,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  grow?: boolean;
}) {
  return (
    <div className={grow ? "min-w-[12rem] flex-1" : undefined}>
      <label htmlFor={htmlFor} className="text-meta uppercase text-ink-muted">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/** Compact control styling for filter rows (h-9, matching the buttons). */
export const filterControlClass =
  "h-9 w-full border border-warm-line bg-warm-white px-2.5 text-ui-sm text-ink transition-colors duration-150 placeholder:text-ink-muted focus:border-gold-shadow focus:outline-none";

/** Search input with its magnifier, for the list screens' primary lookup. */
export function SearchInput({
  name = "q",
  id,
  defaultValue,
  placeholder,
}: {
  name?: string;
  id: string;
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        id={id}
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`${filterControlClass} pl-8`}
      />
    </div>
  );
}
