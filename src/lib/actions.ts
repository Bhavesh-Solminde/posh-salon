// Shared shape returned by every admin server action, consumed by client forms
// via useActionState. `fieldErrors` keys map to form field names.
export type ActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
};

export const ok = (message?: string): ActionResult => ({ ok: true, message });

export const fail = (
  error: string,
  fieldErrors?: Record<string, string>,
): ActionResult => ({ ok: false, error, fieldErrors });

import { ZodError } from "zod";

/** Turn a ZodError into an ActionResult with per-field messages. */
export function zodFail(err: ZodError): ActionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
}

/** Wrap a server action so unexpected errors (DB, auth, etc.) are logged with
 *  the action's name before rethrowing, instead of surfacing as a bare stack
 *  trace with no context in the Vercel function logs. */
export function withErrorLogging<Args extends unknown[], R>(
  name: string,
  fn: (...args: Args) => Promise<R>,
): (...args: Args) => Promise<R> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error(`[action:${name}] failed:`, err);
      throw err;
    }
  };
}
