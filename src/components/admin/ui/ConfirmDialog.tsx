"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import { AdminButton } from "@/components/admin/AdminButton";

/**
 * The admin's one destructive confirmation. Replaces `window.confirm`, which
 * drops OS chrome into the middle of a salon tool and can't say what will
 * actually happen. Focus lands on the dialog, never on the destructive button.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Remove",
  pending = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
  /** Extra consequence detail — what else this touches. */
  children?: ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} autoFocusPanel>
      <p className="text-ui text-ink">{message}</p>
      {children && <div className="mt-3 text-ui-sm text-ink-muted">{children}</div>}
      <div className="mt-6 flex justify-end gap-2">
        <AdminButton type="button" variant="secondary" onClick={onClose} disabled={pending}>
          Cancel
        </AdminButton>
        <AdminButton type="button" variant="danger" onClick={onConfirm} disabled={pending}>
          {pending ? "Removing…" : confirmLabel}
        </AdminButton>
      </div>
    </Modal>
  );
}

/** Hook form for call sites that own their own trigger button. */
export function useConfirm() {
  const [open, setOpen] = useState(false);
  return { open, ask: () => setOpen(true), close: () => setOpen(false) };
}
