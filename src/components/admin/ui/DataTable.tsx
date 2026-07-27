import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  cell: (row: T) => ReactNode;
  /** Hide below `sm` — for columns a phone can live without. */
  hideOnMobile?: boolean;
};

/**
 * Sharp, hairline-ruled table. Money columns should use align="right" (cells get
 * tabular-nums automatically). Renders `empty` when there are no rows.
 *
 * Edge cells carry the panel's own gutter so the first column lines up with the
 * panel heading above it; interior columns stay tighter.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  empty,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  empty?: ReactNode;
  /** Screen-reader name for the table. */
  caption?: string;
}) {
  if (rows.length === 0 && empty !== undefined) return <>{empty}</>;

  const edge = "first:pl-4 last:pr-4 sm:first:pl-6 sm:last:pr-6";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-ui-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-warm-line">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-meta uppercase text-ink-muted ${edge} ${
                  c.align === "right" ? "text-right" : "text-left"
                } ${c.hideOnMobile ? "hidden sm:table-cell" : ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-warm-line/70 transition-colors duration-150 last:border-0 hover:bg-warm-panel/60"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-3 align-middle text-ink ${edge} ${
                    c.align === "right" ? "text-right tabular-nums" : "text-left"
                  } ${c.hideOnMobile ? "hidden sm:table-cell" : ""}`}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The in-table link register: ink, hairline underline that warms to gold on
 * hover, and a visible focus ring. Used for every drill-down cell.
 */
export const tableLinkClass =
  "font-medium text-ink underline decoration-warm-line underline-offset-4 transition-colors duration-150 hover:decoration-gold-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

/** Identifiers — invoice and membership numbers — never break across lines;
 *  the table scrolls instead. */
export const tableIdLinkClass = `${tableLinkClass} whitespace-nowrap tabular-nums`;
