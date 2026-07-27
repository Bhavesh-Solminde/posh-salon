// One source of truth for how the admin renders dates and times. Every screen
// showed its own `toLocaleString("en-IN")` variant, so the same invoice date
// read "26/7/2026" in one table and "26 Jul, 03:22 am" in the next.
//
// House style: day-first, abbreviated month, 24-hour clock (a front desk reads
// "18:30" faster than "06:30 pm", and it never wraps).

const LOCALE = "en-IN";

/** 26 Jul 2026 */
export function formatDate(d: Date): string {
  return d.toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** 26 Jul — for dense cells where the year is implied by the filter. */
export function formatDayMonth(d: Date): string {
  return d.toLocaleDateString(LOCALE, { day: "2-digit", month: "short" });
}

/** 18:30 */
export function formatTime(d: Date): string {
  return d.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** 26 Jul 2026, 18:30 */
export function formatDateTime(d: Date): string {
  return `${formatDate(d)}, ${formatTime(d)}`;
}

/** Sat 26 Jul, 18:30 — for schedules, where the weekday does the work. */
export function formatSchedule(d: Date): string {
  const weekday = d.toLocaleDateString(LOCALE, { weekday: "short" });
  return `${weekday} ${formatDayMonth(d)}, ${formatTime(d)}`;
}

/** "2026-07-26" (an <input type="date"> value) → "26 Jul 2026". */
export function formatISODate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : formatDate(d);
}

/** A date as an <input type="date"> value, in local time. */
export function toDateInput(d: Date): string {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/** A date as an <input type="datetime-local"> value, in local time. */
export function toDateTimeInput(d: Date): string {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
