"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus, Scissors } from "lucide-react";
import { saveService, deleteService } from "../actions";
import { AdminButton } from "@/components/admin/AdminButton";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { Modal } from "@/components/admin/ui/Modal";
import { PanelHeader } from "@/components/admin/ui/Panel";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/admin/ui/Field";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { useToast } from "@/components/admin/ui/Toast";
import { formatINR } from "@/lib/money";
import type { ActionResult } from "@/lib/actions";

export type ServiceRow = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  durationMin: number | null;
  price: number;
  description: string | null;
  isActive: boolean;
};
export type CategoryOption = { id: string; name: string };

export function ServicesManager({
  services,
  categories,
}: {
  services: ServiceRow[];
  categories: CategoryOption[];
}) {
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [open, setOpen] = useState(false);

  const newButton = (
    <AdminButton
      variant="primary"
      onClick={() => {
        setEditing(null);
        setOpen(true);
      }}
    >
      <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> Add Service
    </AdminButton>
  );

  const columns: Column<ServiceRow>[] = [
    {
      key: "name",
      header: "Service",
      cell: (s) => (
        <div>
          <span className="font-medium text-ink">{s.name}</span>
          {s.description && (
            <p className="mt-0.5 line-clamp-1 text-ui-sm text-ink-muted">{s.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "cat",
      header: "Category",
      hideOnMobile: true,
      cell: (s) => s.categoryName ?? <span className="text-ink-muted">Uncategorized</span>,
    },
    {
      key: "dur",
      header: "Duration",
      align: "right",
      hideOnMobile: true,
      cell: (s) =>
        s.durationMin ? (
          <span className="tabular-nums">{s.durationMin} min</span>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    { key: "price", header: "Price", align: "right", cell: (s) => formatINR(s.price) },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (s) => (
        <StatusChip tone={s.isActive ? "success" : "neutral"}>
          {s.isActive ? "Active" : "Inactive"}
        </StatusChip>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (s) => (
        <div className="flex justify-end gap-1">
          <AdminButton
            variant="ghost"
            size="icon"
            aria-label={`Edit ${s.name}`}
            onClick={() => {
              setEditing(s);
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </AdminButton>
          <DeleteButton
            action={deleteService.bind(null, s.id)}
            label={`Remove ${s.name}`}
            title="Remove service"
            confirm={`Remove ${s.name} from the catalog?`}
          >
            It disappears from billing and the public site. Past invoices keep their
            line items.
          </DeleteButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PanelHeader
        title="Service Catalog"
        description={
          services.length > 0
            ? `${services.length} service${services.length === 1 ? "" : "s"} · shown on the public site when active`
            : undefined
        }
        actions={newButton}
      />
      <DataTable
        caption="Services"
        columns={columns}
        rows={services}
        getRowKey={(s) => s.id}
        empty={
          <EmptyState
            icon={Scissors}
            title="No services yet"
            message="Add the treatments your salon offers; they feed billing and the public site."
            action={newButton}
          />
        }
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Service" : "New Service"}
      >
        <ServiceForm service={editing} categories={categories} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function ServiceForm({
  service,
  categories,
  onDone,
}: {
  service: ServiceRow | null;
  categories: CategoryOption[];
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(saveService, { ok: false });

  useEffect(() => {
    if (state.ok) {
      toast(state.message ?? "Saved.");
      onDone();
    }
  }, [state, toast, onDone]);

  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {service && <input type="hidden" name="id" value={service.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={fe.name}>
          <Input id="name" name="name" defaultValue={service?.name ?? ""} />
        </Field>
        <Field label="Category" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" defaultValue={service?.categoryId ?? ""}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Price ₹" htmlFor="price" required error={fe.price}>
          <Input id="price" name="price" type="number" step="0.01" min={0} defaultValue={service?.price ?? 0} />
        </Field>
        <Field label="Duration (min)" htmlFor="durationMin" error={fe.durationMin}>
          <Input id="durationMin" name="durationMin" type="number" min={0} defaultValue={service?.durationMin ?? ""} />
        </Field>
      </div>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={3} defaultValue={service?.description ?? ""} />
      </Field>
      <Checkbox
        name="isActive"
        label="Active"
        defaultChecked={service?.isActive ?? true}
        hint="Available for booking and billing, and listed on the public site."
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
        <SubmitButton>{service ? "Save Service" : "Create Service"}</SubmitButton>
      </div>
    </form>
  );
}
