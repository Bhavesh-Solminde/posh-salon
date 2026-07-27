"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { saveCategory, deleteCategory } from "../actions";
import { Field, Input } from "@/components/admin/ui/Field";
import { PanelHeader } from "@/components/admin/ui/Panel";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import type { ActionResult } from "@/lib/actions";

export function CategoriesManager({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(saveCategory, { ok: false });
  const [pending, start] = useTransition();
  const [removing, setRemoving] = useState<{ id: string; name: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast(state.message ?? "Category added.");
      formRef.current?.reset();
    }
  }, [state, toast]);

  function confirmDelete() {
    if (!removing) return;
    start(async () => {
      const r = await deleteCategory(removing.id);
      toast(
        r.ok ? (r.message ?? "Category removed.") : (r.error ?? "Couldn't remove that category."),
        r.ok ? "success" : "danger",
      );
      setRemoving(null);
    });
  }

  return (
    <div>
      <PanelHeader
        title="Categories"
        description="How services are grouped in billing and on the public site."
      />
      <div className="px-4 py-5 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {categories.length === 0 && (
            <p className="text-ui-sm text-ink-muted">
              No categories yet — services will show as uncategorized.
            </p>
          )}
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 border border-warm-line bg-warm-panel px-3 py-1.5 text-ui-sm text-ink"
            >
              {c.name}
              <button
                type="button"
                aria-label={`Remove category ${c.name}`}
                disabled={pending}
                onClick={() => setRemoving(c)}
                className="text-ink-muted transition-colors duration-150 hover:text-danger disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </button>
            </span>
          ))}
        </div>

        <form ref={formRef} action={action} className="mt-5 flex flex-wrap items-end gap-2">
          <div className="w-full max-w-xs">
            <Field label="New Category" htmlFor="catName" error={state.fieldErrors?.name}>
              <Input id="catName" name="name" placeholder="e.g. Nails" />
            </Field>
          </div>
          <SubmitButton variant="secondary" pendingLabel="Adding…">
            Add
          </SubmitButton>
        </form>
        {state.error && !state.fieldErrors?.name && (
          <p className="mt-2 text-ui-sm text-danger" role="alert">
            {state.error}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={confirmDelete}
        pending={pending}
        title="Remove category"
        message={`Remove the ${removing?.name ?? ""} category?`}
      >
        Its services stay in the catalog — they just become uncategorized.
      </ConfirmDialog>
    </div>
  );
}
