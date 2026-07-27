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
