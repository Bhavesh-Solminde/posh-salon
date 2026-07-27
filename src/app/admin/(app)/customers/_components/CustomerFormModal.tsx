"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { saveCustomer } from "../actions";
import { AdminButton } from "@/components/admin/AdminButton";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/Field";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { useToast } from "@/components/admin/ui/Toast";
import type { ActionResult } from "@/lib/actions";

export type CustomerFormData = {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  birthday: string;
  anniversary: string;
  notes: string;
  allergies: string;
};

/** Renders either a "New Customer" primary button or an edit icon button,
 *  each opening the same modal form. */
export function CustomerFormModal({ customer }: { customer?: CustomerFormData }) {
  const [open, setOpen] = useState(false);
  const editing = !!customer;

  return (
    <>
      {editing ? (
        <AdminButton variant="ghost" size="icon" aria-label={`Edit ${customer!.name}`} onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </AdminButton>
      ) : (
        <AdminButton variant="primary" size="md" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> New Customer
        </AdminButton>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Customer" : "Register Customer"} size="lg">
        <CustomerForm customer={customer} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function CustomerForm({ customer, onDone }: { customer?: CustomerFormData; onDone: () => void }) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(saveCustomer, { ok: false });
  useEffect(() => { if (state.ok) { toast(state.message ?? "Saved."); onDone(); } }, [state, toast, onDone]);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {customer && <input type="hidden" name="id" value={customer.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={fe.name}>
          <Input id="name" name="name" defaultValue={customer?.name ?? ""} />
        </Field>
        <Field label="Phone" htmlFor="phone" required error={fe.phone}>
          <Input id="phone" name="phone" defaultValue={customer?.phone ?? ""} />
        </Field>
        <Field label="Email" htmlFor="email" error={fe.email}>
          <Input id="email" name="email" type="email" defaultValue={customer?.email ?? ""} />
        </Field>
        <Field label="Gender" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue={customer?.gender ?? ""}>
            <option value="">—</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </Select>
        </Field>
        <Field label="Birthday" htmlFor="birthday">
          <Input id="birthday" name="birthday" type="date" defaultValue={customer?.birthday ?? ""} />
        </Field>
        <Field label="Anniversary" htmlFor="anniversary">
          <Input id="anniversary" name="anniversary" type="date" defaultValue={customer?.anniversary ?? ""} />
        </Field>
      </div>
      <Field label="Allergies / sensitivities" htmlFor="allergies">
        <Input id="allergies" name="allergies" defaultValue={customer?.allergies ?? ""} />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} defaultValue={customer?.notes ?? ""} />
      </Field>
      {state.error && <p className="text-ui-sm text-danger" role="alert">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <AdminButton type="button" variant="secondary" onClick={onDone}>Cancel</AdminButton>
        <SubmitButton>{customer ? "Save Customer" : "Register Customer"}</SubmitButton>
      </div>
    </form>
  );
}
