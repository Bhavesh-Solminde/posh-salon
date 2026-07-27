"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Pencil, UserCog } from "lucide-react";
import { saveEmployee, deleteEmployee, markAttendance } from "../actions";
import { AdminButton } from "@/components/admin/AdminButton";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { Modal } from "@/components/admin/ui/Modal";
import { PanelHeader } from "@/components/admin/ui/Panel";
import { Checkbox, Field, Input } from "@/components/admin/ui/Field";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { useToast } from "@/components/admin/ui/Toast";
import type { ActionResult } from "@/lib/actions";

export type EmployeeRow = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  joinedAt: string | null;
  isActive: boolean;
  attendance: "PRESENT" | "ABSENT" | "LEAVE" | null;
};

type Attendance = NonNullable<EmployeeRow["attendance"]>;

// Single letters on their own are unreadable to a screen reader and ambiguous on
// screen; the letter stays as the compact mark, the word carries the meaning.
const ATTENDANCE: { value: Attendance; letter: string; label: string; className: string }[] = [
  { value: "PRESENT", letter: "P", label: "Present", className: "border-success bg-success-soft text-success" },
  { value: "ABSENT", letter: "A", label: "Absent", className: "border-danger bg-danger-soft text-danger" },
  { value: "LEAVE", letter: "L", label: "Leave", className: "border-warning bg-warning-soft text-warning" },
];

export function EmployeesManager({
  employees,
  date,
  dateLabel,
}: {
  employees: EmployeeRow[];
  date: string;
  dateLabel: string;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<EmployeeRow | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function mark(employee: EmployeeRow, status: Attendance, label: string) {
    start(async () => {
      const r = await markAttendance(employee.id, date, status);
      toast(
        r.ok
          ? `${employee.name} marked ${label.toLowerCase()} for ${dateLabel}.`
          : (r.error ?? "Couldn't save that attendance mark."),
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
      <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> Add Employee
    </AdminButton>
  );

  const present = employees.filter((e) => e.attendance === "PRESENT").length;

  const columns: Column<EmployeeRow>[] = [
    {
      key: "name",
      header: "Employee",
      cell: (e) => (
        <div>
          <span className="font-medium text-ink">{e.name}</span>
          <p className="mt-0.5 text-ui-sm text-ink-muted sm:hidden">{e.role}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", hideOnMobile: true, cell: (e) => e.role },
    {
      key: "phone",
      header: "Phone",
      hideOnMobile: true,
      cell: (e) =>
        e.phone ? (
          <span className="tabular-nums">{e.phone}</span>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      hideOnMobile: true,
      cell: (e) => (
        <StatusChip tone={e.isActive ? "success" : "neutral"}>
          {e.isActive ? "Active" : "Inactive"}
        </StatusChip>
      ),
    },
    {
      key: "attendance",
      header: "Attendance",
      cell: (e) => (
        <div className="flex gap-1" role="group" aria-label={`Attendance for ${e.name} on ${dateLabel}`}>
          {ATTENDANCE.map((a) => {
            const active = e.attendance === a.value;
            return (
              <button
                key={a.value}
                type="button"
                disabled={pending}
                onClick={() => mark(e, a.value, a.label)}
                aria-pressed={active}
                title={a.label}
                className={`border px-2 py-1 text-meta uppercase transition-colors duration-150 disabled:opacity-50 ${
                  active ? a.className : "border-warm-line text-ink-muted hover:bg-warm-panel"
                }`}
              >
                <span aria-hidden>{a.letter}</span>
                <span className="sr-only">{a.label}</span>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (e) => (
        <div className="flex justify-end gap-1">
          <AdminButton
            variant="ghost"
            size="icon"
            aria-label={`Edit ${e.name}`}
            onClick={() => {
              setEditing(e);
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </AdminButton>
          <DeleteButton
            action={deleteEmployee.bind(null, e.id)}
            label={`Remove ${e.name}`}
            title="Remove employee"
            confirm={`Remove ${e.name} from the team?`}
          >
            Their past attendance stays on record; they stop appearing as a stylist on
            new appointments.
          </DeleteButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PanelHeader
        title="Team"
        description={
          employees.length > 0
            ? `Attendance for ${dateLabel} · ${present} of ${employees.length} marked present`
            : undefined
        }
        actions={newButton}
      />
      <DataTable
        caption={`Employees and attendance for ${dateLabel}`}
        columns={columns}
        rows={employees}
        getRowKey={(e) => e.id}
        empty={
          <EmptyState
            icon={UserCog}
            title="No employees yet"
            message="Add your team to track attendance and assign stylists to appointments."
            action={newButton}
          />
        }
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Employee" : "New Employee"}
      >
        <EmployeeForm employee={editing} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function EmployeeForm({ employee, onDone }: { employee: EmployeeRow | null; onDone: () => void }) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(saveEmployee, { ok: false });
  useEffect(() => {
    if (state.ok) {
      toast(state.message ?? "Saved.");
      onDone();
    }
  }, [state, toast, onDone]);
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      {employee && <input type="hidden" name="id" value={employee.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={fe.name}>
          <Input id="name" name="name" defaultValue={employee?.name ?? ""} />
        </Field>
        <Field label="Role" htmlFor="role" required error={fe.role}>
          <Input id="role" name="role" placeholder="e.g. Senior Stylist" defaultValue={employee?.role ?? ""} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" defaultValue={employee?.phone ?? ""} />
        </Field>
        <Field label="Joined" htmlFor="joinedAt">
          <Input id="joinedAt" name="joinedAt" type="date" defaultValue={employee?.joinedAt ?? ""} />
        </Field>
      </div>
      <Checkbox
        name="isActive"
        label="Active"
        defaultChecked={employee?.isActive ?? true}
        hint="Inactive staff keep their records but can't be assigned to new appointments."
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
        <SubmitButton>{employee ? "Save Employee" : "Add Employee"}</SubmitButton>
      </div>
    </form>
  );
}
