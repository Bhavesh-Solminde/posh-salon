"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Pencil, Check, UserX, CalendarDays } from "lucide-react";
import { saveAppointment, setAppointmentStatus, deleteAppointment } from "../actions";
import { AdminButton } from "@/components/admin/AdminButton";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { Modal } from "@/components/admin/ui/Modal";
import { PanelHeader } from "@/components/admin/ui/Panel";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/Field";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { StatusChip, type ChipTone } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { useToast } from "@/components/admin/ui/Toast";
import type { ActionResult } from "@/lib/actions";

export type ApptRow = {
  id: string;
  customerId: string | null;
  customerLabel: string;
  phone: string | null;
  serviceId: string | null;
  serviceName: string | null;
  stylistId: string | null;
  stylistName: string | null;
  startAtISO: string;
  startAtLabel: string;
  status: "BOOKED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
  notes: string | null;
};
type Opt = { id: string; name: string };

const STATUS_TONE: Record<ApptRow["status"], ChipTone> = {
  BOOKED: "info", COMPLETED: "success", NO_SHOW: "danger", CANCELLED: "danger",
};

export function AppointmentsManager({
  appointments,
  customers,
  services,
  stylists,
  bookedCount,
}: {
  appointments: ApptRow[];
  customers: { id: string; name: string; phone: string }[];
  services: Opt[];
  stylists: Opt[];
  bookedCount: number;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<ApptRow | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function quick(id: string, status: ApptRow["status"], label: string) {
    start(async () => {
      const r = await setAppointmentStatus(id, status);
      toast(
        r.ok ? `Marked ${label}.` : (r.error ?? "Couldn't update that booking."),
        r.ok ? "success" : "danger",
      );
    });
  }

  const newButton = (
    <AdminButton
      variant="primary"
      onClick={() => {
        setEditing(null);
        setOpen(true);
      }}
    >
      <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> New Appointment
    </AdminButton>
  );

  const columns: Column<ApptRow>[] = [
    { key: "when", header: "When", cell: (a) => a.startAtLabel },
    {
      key: "customer",
      header: "Customer",
      cell: (a) => (
        <div>
          <span className="font-medium text-ink">{a.customerLabel}</span>
          {a.phone && (
            <p className="mt-0.5 text-ui-sm tabular-nums text-ink-muted sm:hidden">{a.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      hideOnMobile: true,
      cell: (a) => a.serviceName ?? <span className="text-ink-muted">—</span>,
    },
    {
      key: "stylist",
      header: "Stylist",
      hideOnMobile: true,
      cell: (a) => a.stylistName ?? <span className="text-ink-muted">—</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (a) => <StatusChip tone={STATUS_TONE[a.status]}>{a.status.replace("_", " ")}</StatusChip>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (a) => (
        <div className="flex justify-end gap-1">
          {a.status === "BOOKED" && (
            <>
              <AdminButton
                variant="ghost"
                size="icon"
                aria-label={`Mark ${a.customerLabel}'s appointment completed`}
                disabled={pending}
                onClick={() => quick(a.id, "COMPLETED", "completed")}
              >
                <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </AdminButton>
              <AdminButton
                variant="ghost"
                size="icon"
                aria-label={`Mark ${a.customerLabel} a no-show`}
                disabled={pending}
                onClick={() => quick(a.id, "NO_SHOW", "no-show")}
              >
                <UserX className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </AdminButton>
            </>
          )}
          <AdminButton
            variant="ghost"
            size="icon"
            aria-label={`Edit ${a.customerLabel}'s appointment`}
            onClick={() => {
              setEditing(a);
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </AdminButton>
          <DeleteButton
            action={deleteAppointment.bind(null, a.id)}
            label={`Remove ${a.customerLabel}'s appointment`}
            title="Remove appointment"
            confirm={`Remove the ${a.startAtLabel} appointment for ${a.customerLabel}?`}
          >
            To keep the booking on record instead, edit it and set the status to
            Cancelled.
          </DeleteButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PanelHeader
        title="All Bookings"
        description={
          appointments.length === 0
            ? undefined
            : `${appointments.length} on record · ${bookedCount} still booked`
        }
        actions={newButton}
      />
      <DataTable
        caption="Appointments"
        columns={columns}
        rows={appointments}
        getRowKey={(a) => a.id}
        empty={
          <EmptyState
            icon={CalendarDays}
            title="No appointments"
            message="Book walk-ins and future appointments here."
            action={newButton}
          />
        }
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Appointment" : "New Appointment"}
        size="lg"
      >
        <ApptForm
          appt={editing}
          customers={customers}
          services={services}
          stylists={stylists}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}

function ApptForm({
  appt, customers, services, stylists, onDone,
}: {
  appt: ApptRow | null;
  customers: { id: string; name: string; phone: string }[];
  services: Opt[];
  stylists: Opt[];
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(saveAppointment, { ok: false });
  useEffect(() => {
    if (state.ok) {
      toast(state.message ?? "Saved.");
      onDone();
    }
  }, [state, toast, onDone]);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {appt && <input type="hidden" name="id" value={appt.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Customer"
          htmlFor="customerId"
          hint="Registered client — or leave as walk-in and give a name"
        >
          <Select id="customerId" name="customerId" defaultValue={appt?.customerId ?? ""}>
            <option value="">Walk-in</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.phone}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Walk-in name" htmlFor="customerName" error={fe.customerName}>
          <Input
            id="customerName"
            name="customerName"
            defaultValue={appt?.customerId ? "" : (appt?.customerLabel ?? "")}
          />
        </Field>
        <Field label="Service" htmlFor="serviceId">
          <Select id="serviceId" name="serviceId" defaultValue={appt?.serviceId ?? ""}>
            <option value="">Not decided yet</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Stylist" htmlFor="stylistId">
          <Select id="stylistId" name="stylistId" defaultValue={appt?.stylistId ?? ""}>
            <option value="">Unassigned</option>
            {stylists.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date & Time" htmlFor="startAt" required error={fe.startAt}>
          <Input id="startAt" name="startAt" type="datetime-local" defaultValue={appt?.startAtISO ?? ""} />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={appt?.status ?? "BOOKED"}>
            <option value="BOOKED">Booked</option>
            <option value="COMPLETED">Completed</option>
            <option value="NO_SHOW">No-show</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </Field>
      </div>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} defaultValue={appt?.notes ?? ""} />
      </Field>
      {state.error && (
        <p className="text-ui-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <AdminButton type="button" variant="secondary" onClick={onDone}>
          Cancel
        </AdminButton>
        <SubmitButton>{appt ? "Save Appointment" : "Book Appointment"}</SubmitButton>
      </div>
    </form>
  );
}
