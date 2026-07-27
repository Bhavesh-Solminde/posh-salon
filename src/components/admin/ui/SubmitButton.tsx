"use client";

import { useFormStatus } from "react-dom";
import { AdminButton } from "@/components/admin/AdminButton";
import type { ComponentProps, ReactNode } from "react";

/** Primary submit button that reflects the enclosing form's pending state. */
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: {
  children: ReactNode;
  pendingLabel?: string;
} & Omit<ComponentProps<typeof AdminButton>, "type">) {
  const { pending } = useFormStatus();
  return (
    <AdminButton type="submit" disabled={pending} {...props}>
      {pending ? (pendingLabel ?? "Saving…") : children}
    </AdminButton>
  );
}
