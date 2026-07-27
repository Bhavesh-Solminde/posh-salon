"use client";

import { useActionState, useEffect, useState } from "react";
import { Minus } from "lucide-react";
import { recordExpense } from "../actions";
import { AdminButton } from "@/components/admin/AdminButton";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Select } from "@/components/admin/ui/Field";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { useToast } from "@/components/admin/ui/Toast";
import type { ActionResult } from "@/lib/actions";

export function ExpenseModal() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(recordExpense, { ok: false });
  useEffect(() => { if (state.ok) { toast(state.message ?? "Recorded."); setOpen(false); } }, [state, toast]);
  const fe = state.fieldErrors ?? {};

  return (
    <>
      <AdminButton variant="secondary" size="md" onClick={() => setOpen(true)}>
        <Minus className="h-4 w-4" strokeWidth={2} aria-hidden /> Record Expense
      </AdminButton>
      <Modal open={open} onClose={() => setOpen(false)} title="Record Expense">
        <form action={action} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="category">
              <Select id="category" name="category" defaultValue="MISC_EXPENSE">
                <option value="MISC_EXPENSE">Miscellaneous</option>
                <option value="SUPPLIER_PURCHASE">Supplier purchase</option>
              </Select>
            </Field>
            <Field label="Amount ₹" htmlFor="amount" required error={fe.amount}>
              <Input id="amount" name="amount" type="number" step="0.01" />
            </Field>
            <Field label="Date" htmlFor="occurredAt">
              <Input id="occurredAt" name="occurredAt" type="date" />
            </Field>
          </div>
          <Field label="Description" htmlFor="description" required error={fe.description}>
            <Input id="description" name="description" placeholder="e.g. Electricity bill" />
          </Field>
          {state.error && <p className="text-ui-sm text-danger" role="alert">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <AdminButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</AdminButton>
            <SubmitButton>Record Expense</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
