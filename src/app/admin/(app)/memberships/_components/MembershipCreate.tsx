"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createMembership } from "../actions";
import { AdminButton } from "@/components/admin/AdminButton";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Select, Textarea } from "@/components/admin/ui/Field";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { useToast } from "@/components/admin/ui/Toast";
import { formatINR } from "@/lib/money";
import type { ActionResult } from "@/lib/actions";

type CustomerOpt = { id: string; name: string; phone: string };
type PlanOpt = { id: string; name: string; price: number; bonusAmount: number };

export function MembershipCreate({
  customers,
  plans,
}: {
  customers: CustomerOpt[];
  plans: PlanOpt[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AdminButton variant="primary" size="md" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> New Membership
      </AdminButton>
      <Modal open={open} onClose={() => setOpen(false)} title="Create Membership">
        <MembershipForm customers={customers} plans={plans} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function MembershipForm({
  customers,
  plans,
  onDone,
}: {
  customers: CustomerOpt[];
  plans: PlanOpt[];
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(createMembership, { ok: false });
  useEffect(() => { if (state.ok) { toast(state.message ?? "Created."); onDone(); } }, [state, toast, onDone]);
  const fe = state.fieldErrors ?? {};

  if (customers.length === 0) {
    return <p className="text-ui-sm text-ink-muted">Register a customer first, then create their membership.</p>;
  }

  return (
    <form action={action} className="space-y-5">
      <Field label="Customer" htmlFor="customerId" required error={fe.customerId}>
        <Select id="customerId" name="customerId" defaultValue="">
          <option value="" disabled>Choose a customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>
          ))}
        </Select>
      </Field>
      <Field label="Plan" htmlFor="planId" required error={fe.planId}>
        <Select id="planId" name="planId" defaultValue="">
          <option value="" disabled>Choose a plan…</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — pay {formatINR(p.price)}, wallet {formatINR(p.price + p.bonusAmount)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Payment Method" htmlFor="paymentMethod">
        <Select id="paymentMethod" name="paymentMethod" defaultValue="CASH">
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
        </Select>
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} />
      </Field>
      {state.error && <p className="text-ui-sm text-danger" role="alert">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <AdminButton type="button" variant="secondary" onClick={onDone}>Cancel</AdminButton>
        <SubmitButton>Create Membership</SubmitButton>
      </div>
    </form>
  );
}
