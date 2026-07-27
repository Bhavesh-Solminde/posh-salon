"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus, Wallet } from "lucide-react";
import { savePlan, deletePlan } from "../actions";
import { AdminButton } from "@/components/admin/AdminButton";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { Modal } from "@/components/admin/ui/Modal";
import { PanelHeader } from "@/components/admin/ui/Panel";
import { Checkbox, Field, Input, Select } from "@/components/admin/ui/Field";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { useToast } from "@/components/admin/ui/Toast";
import { formatINR } from "@/lib/money";
import type { ActionResult } from "@/lib/actions";

export type PlanRow = {
  id: string;
  name: string;
  tier: string;
  price: number;
  validityDays: number;
  bonusAmount: number;
  discountPct: number;
  isActive: boolean;
};

export function PlansManager({ plans }: { plans: PlanRow[] }) {
  const [editing, setEditing] = useState<PlanRow | null>(null);
  const [open, setOpen] = useState(false);

  const newButton = (
    <AdminButton
      variant="secondary"
      onClick={() => {
        setEditing(null);
        setOpen(true);
      }}
    >
      <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> Add Plan
    </AdminButton>
  );

  const columns: Column<PlanRow>[] = [
    {
      key: "name",
      header: "Plan",
      cell: (p) => (
        <div>
          <span className="font-medium text-ink">{p.name}</span>
          <p className="mt-0.5 text-ui-sm text-ink-muted sm:hidden">{p.tier}</p>
        </div>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      hideOnMobile: true,
      cell: (p) => <StatusChip tone="neutral">{p.tier}</StatusChip>,
    },
    { key: "price", header: "Price", align: "right", cell: (p) => formatINR(p.price) },
    {
      key: "bonus",
      header: "Bonus",
      align: "right",
      hideOnMobile: true,
      cell: (p) => <span className="text-ink-muted">{formatINR(p.bonusAmount)}</span>,
    },
    {
      key: "wallet",
      header: "Wallet Value",
      align: "right",
      cell: (p) => <span className="font-medium">{formatINR(p.price + p.bonusAmount)}</span>,
    },
    {
      key: "disc",
      header: "Discount",
      align: "right",
      hideOnMobile: true,
      cell: (p) => `${p.discountPct}%`,
    },
    {
      key: "validity",
      header: "Validity",
      align: "right",
      hideOnMobile: true,
      cell: (p) => `${p.validityDays} days`,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (p) => (
        <StatusChip tone={p.isActive ? "success" : "neutral"}>
          {p.isActive ? "Active" : "Inactive"}
        </StatusChip>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <AdminButton
            variant="ghost"
            size="icon"
            aria-label={`Edit ${p.name}`}
            onClick={() => {
              setEditing(p);
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </AdminButton>
          <DeleteButton
            action={deletePlan.bind(null, p.id)}
            label={`Remove ${p.name}`}
            title="Remove plan"
            confirm={`Remove the ${p.name} plan?`}
          >
            Memberships already sold on this plan keep their wallet balance and validity.
          </DeleteButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PanelHeader
        title="Membership Plans"
        description="Price is what the client pays; wallet value is what they can spend on services."
        actions={newButton}
      />
      <DataTable
        caption="Membership plans"
        columns={columns}
        rows={plans}
        getRowKey={(p) => p.id}
        empty={
          <EmptyState
            icon={Wallet}
            title="No plans yet"
            message="Add a plan so the front desk can sell memberships."
            action={newButton}
          />
        }
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Plan" : "New Plan"}>
        <PlanForm plan={editing} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function PlanForm({ plan, onDone }: { plan: PlanRow | null; onDone: () => void }) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(savePlan, { ok: false });

  useEffect(() => {
    if (state.ok) {
      toast(state.message ?? "Saved.");
      onDone();
    }
  }, [state, toast, onDone]);

  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={fe.name}>
          <Input id="name" name="name" defaultValue={plan?.name ?? ""} />
        </Field>
        <Field label="Tier" htmlFor="tier">
          <Select id="tier" name="tier" defaultValue={plan?.tier ?? "SILVER"}>
            <option value="SILVER">Silver</option>
            <option value="GOLD">Gold</option>
            <option value="PLATINUM">Platinum</option>
            <option value="CUSTOM">Custom</option>
          </Select>
        </Field>
        <Field label="Price ₹" htmlFor="price" required error={fe.price} hint="What the client pays">
          <Input id="price" name="price" type="number" step="0.01" min={0} defaultValue={plan?.price ?? 0} />
        </Field>
        <Field
          label="Bonus ₹"
          htmlFor="bonusAmount"
          error={fe.bonusAmount}
          hint="Extra service value added to the wallet"
        >
          <Input id="bonusAmount" name="bonusAmount" type="number" step="0.01" min={0} defaultValue={plan?.bonusAmount ?? 0} />
        </Field>
        <Field label="Discount %" htmlFor="discountPct" error={fe.discountPct}>
          <Input id="discountPct" name="discountPct" type="number" step="0.01" min={0} defaultValue={plan?.discountPct ?? 0} />
        </Field>
        <Field label="Validity (days)" htmlFor="validityDays" required error={fe.validityDays}>
          <Input id="validityDays" name="validityDays" type="number" min={1} defaultValue={plan?.validityDays ?? 365} />
        </Field>
      </div>
      <Checkbox
        name="isActive"
        label="Active"
        defaultChecked={plan?.isActive ?? true}
        hint="Inactive plans can't be sold, but existing memberships keep working."
      />

      {state.error && (
        <p className="text-ui-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <AdminButton type="button" variant="secondary" onClick={onDone}>
          Cancel
        </AdminButton>
        <SubmitButton>{plan ? "Save Plan" : "Create Plan"}</SubmitButton>
      </div>
    </form>
  );
}
