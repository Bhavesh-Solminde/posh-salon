"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import type { ActionResult } from "@/lib/actions";

/** Generic row delete, guarded by the admin's own confirmation dialog. Pass a
 *  bound server action, e.g. `action={deleteCustomer.bind(null, id)}`. */
export function DeleteButton({
  action,
  label,
  confirm,
  title = "Remove record",
  confirmLabel = "Remove",
  children,
}: {
  action: () => Promise<ActionResult>;
  /** Accessible name of the trigger, e.g. "Remove Ananya Iyer". */
  label: string;
  /** The question the dialog asks. */
  confirm: string;
  title?: string;
  confirmLabel?: string;
  /** Extra consequence detail shown under the question. */
  children?: ReactNode;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <AdminButton
        variant="ghost"
        size="icon"
        aria-label={label}
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </AdminButton>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        pending={pending}
        title={title}
        message={confirm}
        confirmLabel={confirmLabel}
        onConfirm={() =>
          start(async () => {
            const r = await action();
            toast(
              r.ok ? (r.message ?? "Removed.") : (r.error ?? "Couldn't remove that. Try again."),
              r.ok ? "success" : "danger",
            );
            setOpen(false);
          })
        }
      >
        {children}
      </ConfirmDialog>
    </>
  );
}
