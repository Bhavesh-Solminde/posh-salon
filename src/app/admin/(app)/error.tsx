"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";

/**
 * Section-level recovery. The database sits behind a network hop, so a failed
 * query is a normal event at the counter — it should offer a retry, not a stack
 * trace on a blank page.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-danger bg-danger-soft text-danger">
        <TriangleAlert className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </div>
      <h1 className="mt-5 font-display text-ui-title text-ink">
        This screen didn&rsquo;t load
      </h1>
      <p className="mt-2 max-w-md text-ui text-ink-muted">
        The salon database didn&rsquo;t answer in time. Nothing was saved or lost —
        try again, and if it keeps failing, check the connection.
      </p>
      {error.digest && (
        <p className="mt-3 text-ui-sm text-ink-muted">
          Reference <span className="tabular-nums">{error.digest}</span>
        </p>
      )}
      <div className="mt-6">
        <AdminButton variant="primary" onClick={reset}>
          Try again
        </AdminButton>
      </div>
    </div>
  );
}
