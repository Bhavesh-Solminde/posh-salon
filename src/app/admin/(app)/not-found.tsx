import Link from "next/link";
import { FileQuestion } from "lucide-react";

/** Keeps a missing record inside the admin frame instead of dropping the user
 *  on Next's default 404, which reads like the app broke. */
export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-warm-line bg-warm-panel text-gold-shadow">
        <FileQuestion className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </div>
      <h1 className="mt-5 font-display text-ui-title text-ink">Record not found</h1>
      <p className="mt-2 max-w-md text-ui text-ink-muted">
        This customer, invoice, or membership no longer exists — it may have been
        removed.
      </p>
      <Link
        href="/admin/dashboard"
        className="mt-6 inline-flex h-9 items-center border border-warm-line px-4 text-ui-sm text-ink transition-colors duration-150 hover:bg-warm-panel"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
