"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { Plus, Pencil, Tag, Quote, Star } from "lucide-react";
import { saveOffer, deleteOffer, saveTestimonial, deleteTestimonial } from "../actions";
import { AdminButton } from "@/components/admin/AdminButton";
import { DataTable, type Column } from "@/components/admin/ui/DataTable";
import { Modal } from "@/components/admin/ui/Modal";
import { PanelHeader } from "@/components/admin/ui/Panel";
import { Checkbox, Field, Input, Textarea } from "@/components/admin/ui/Field";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { DeleteButton } from "@/components/admin/ui/DeleteButton";
import { useToast } from "@/components/admin/ui/Toast";
import type { ActionResult } from "@/lib/actions";

export type OfferRow = {
  id: string; title: string; description: string | null; badge: string | null;
  active: boolean; sortOrder: number;
};
export type TestimonialRow = {
  id: string; author: string; role: string | null; quote: string;
  rating: number; active: boolean; sortOrder: number;
};

const TABS = [
  { id: "offers", label: "Offers" },
  { id: "testimonials", label: "Testimonials" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function WebsiteManager({
  offers, testimonials,
}: {
  offers: OfferRow[];
  testimonials: TestimonialRow[];
}) {
  const [tab, setTab] = useState<TabId>("offers");
  const base = useId();

  return (
    <div>
      {/* Real tab semantics: these switch panels within the page, so a screen
          reader should hear "tab, 1 of 2, selected", not a bare button. */}
      <div className="flex gap-1 border-b border-warm-line px-4 pt-4 sm:px-6" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${base}-${t.id}-tab`}
            aria-selected={tab === t.id}
            aria-controls={`${base}-${t.id}-panel`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-ui transition-colors duration-150 ${
              tab === t.id
                ? "border-gold-shadow font-medium text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-${t.id}-panel`}
          aria-labelledby={`${base}-${t.id}-tab`}
          hidden={tab !== t.id}
        >
          {t.id === "offers" ? (
            <OffersPanel offers={offers} />
          ) : (
            <TestimonialsPanel testimonials={testimonials} />
          )}
        </div>
      ))}
    </div>
  );
}

function OffersPanel({ offers }: { offers: OfferRow[] }) {
  const [editing, setEditing] = useState<OfferRow | null>(null);
  const [open, setOpen] = useState(false);

  const newButton = (
    <AdminButton
      variant="primary"
      onClick={() => {
        setEditing(null);
        setOpen(true);
      }}
    >
      <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> Add Offer
    </AdminButton>
  );

  const columns: Column<OfferRow>[] = [
    {
      key: "sort",
      header: "#",
      hideOnMobile: true,
      cell: (o) => <span className="tabular-nums text-ink-muted">{o.sortOrder}</span>,
    },
    {
      key: "title",
      header: "Offer",
      cell: (o) => (
        <div>
          <span className="font-medium text-ink">{o.title}</span>
          {o.badge && (
            <span className="ml-2 text-meta uppercase text-gold-shadow">{o.badge}</span>
          )}
          {o.description && (
            <p className="mt-0.5 line-clamp-1 text-ui-sm text-ink-muted">{o.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "active",
      header: "Status",
      align: "right",
      cell: (o) => (
        <StatusChip tone={o.active ? "success" : "neutral"}>
          {o.active ? "Live" : "Hidden"}
        </StatusChip>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (o) => (
        <div className="flex justify-end gap-1">
          <AdminButton
            variant="ghost"
            size="icon"
            aria-label={`Edit ${o.title}`}
            onClick={() => {
              setEditing(o);
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </AdminButton>
          <DeleteButton
            action={deleteOffer.bind(null, o.id)}
            label={`Remove ${o.title}`}
            title="Remove offer"
            confirm={`Remove the “${o.title}” offer?`}
          >
            It disappears from the public site immediately. To keep it for later, edit it
            and untick “Live on website”.
          </DeleteButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PanelHeader
        title="Offers"
        description="Shown on the homepage in this order, lowest number first."
        actions={newButton}
      />
      <DataTable
        caption="Website offers"
        columns={columns}
        rows={offers}
        getRowKey={(o) => o.id}
        empty={
          <EmptyState
            icon={Tag}
            title="No offers yet"
            message="Feature promotions and seasonal packages here."
            action={newButton}
          />
        }
      />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Offer" : "New Offer"}>
        <OfferForm offer={editing} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function OfferForm({ offer, onDone }: { offer: OfferRow | null; onDone: () => void }) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(saveOffer, { ok: false });
  useEffect(() => {
    if (state.ok) {
      toast(state.message ?? "Saved.");
      onDone();
    }
  }, [state, toast, onDone]);
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      {offer && <input type="hidden" name="id" value={offer.id} />}
      <Field label="Title" htmlFor="title" required error={fe.title}>
        <Input id="title" name="title" defaultValue={offer?.title ?? ""} />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={2} defaultValue={offer?.description ?? ""} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Badge" htmlFor="badge" hint="e.g. 20% off, Limited">
          <Input id="badge" name="badge" defaultValue={offer?.badge ?? ""} />
        </Field>
        <Field label="Sort order" htmlFor="sortOrder" hint="Lower numbers show first">
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={String(offer?.sortOrder ?? 0)} />
        </Field>
      </div>
      <Checkbox name="active" label="Live on website" defaultChecked={offer?.active ?? true} />
      {state.error && (
        <p className="text-ui-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <AdminButton type="button" variant="secondary" onClick={onDone}>
          Cancel
        </AdminButton>
        <SubmitButton>{offer ? "Save Offer" : "Add Offer"}</SubmitButton>
      </div>
    </form>
  );
}

function TestimonialsPanel({ testimonials }: { testimonials: TestimonialRow[] }) {
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [open, setOpen] = useState(false);

  const newButton = (
    <AdminButton
      variant="primary"
      onClick={() => {
        setEditing(null);
        setOpen(true);
      }}
    >
      <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> Add Testimonial
    </AdminButton>
  );

  const columns: Column<TestimonialRow>[] = [
    {
      key: "sort",
      header: "#",
      hideOnMobile: true,
      cell: (t) => <span className="tabular-nums text-ink-muted">{t.sortOrder}</span>,
    },
    {
      key: "author",
      header: "Client",
      cell: (t) => (
        <div>
          <span className="font-medium text-ink">{t.author}</span>
          {t.role && <span className="ml-2 text-ui-sm text-ink-muted">{t.role}</span>}
          <p className="mt-0.5 line-clamp-1 text-ui-sm text-ink-muted">
            &ldquo;{t.quote}&rdquo;
          </p>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      hideOnMobile: true,
      cell: (t) => (
        <span className="inline-flex items-center gap-0.5 text-gold-shadow">
          <span className="sr-only">{t.rating} out of 5</span>
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} aria-hidden />
          ))}
        </span>
      ),
    },
    {
      key: "active",
      header: "Status",
      align: "right",
      cell: (t) => (
        <StatusChip tone={t.active ? "success" : "neutral"}>
          {t.active ? "Live" : "Hidden"}
        </StatusChip>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (t) => (
        <div className="flex justify-end gap-1">
          <AdminButton
            variant="ghost"
            size="icon"
            aria-label={`Edit ${t.author}'s testimonial`}
            onClick={() => {
              setEditing(t);
              setOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </AdminButton>
          <DeleteButton
            action={deleteTestimonial.bind(null, t.id)}
            label={`Remove ${t.author}'s testimonial`}
            title="Remove testimonial"
            confirm={`Remove ${t.author}'s testimonial?`}
          >
            It disappears from the public site immediately.
          </DeleteButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PanelHeader
        title="Testimonials"
        description="Only publish words a client actually gave you."
        actions={newButton}
      />
      <DataTable
        caption="Website testimonials"
        columns={columns}
        rows={testimonials}
        getRowKey={(t) => t.id}
        empty={
          <EmptyState
            icon={Quote}
            title="No testimonials yet"
            message="Showcase what your clients say about the salon."
            action={newButton}
          />
        }
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Testimonial" : "New Testimonial"}
      >
        <TestimonialForm testimonial={editing} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function TestimonialForm({
  testimonial,
  onDone,
}: {
  testimonial: TestimonialRow | null;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(saveTestimonial, { ok: false });
  useEffect(() => {
    if (state.ok) {
      toast(state.message ?? "Saved.");
      onDone();
    }
  }, [state, toast, onDone]);
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Author" htmlFor="author" required error={fe.author}>
          <Input id="author" name="author" defaultValue={testimonial?.author ?? ""} />
        </Field>
        <Field label="Role" htmlFor="role" hint="e.g. Bridal client">
          <Input id="role" name="role" defaultValue={testimonial?.role ?? ""} />
        </Field>
      </div>
      <Field label="Quote" htmlFor="quote" required error={fe.quote}>
        <Textarea id="quote" name="quote" rows={3} defaultValue={testimonial?.quote ?? ""} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Rating" htmlFor="rating" hint="1 to 5" error={fe.rating}>
          <Input
            id="rating"
            name="rating"
            type="number"
            min={1}
            max={5}
            defaultValue={String(testimonial?.rating ?? 5)}
          />
        </Field>
        <Field label="Sort order" htmlFor="sortOrder" hint="Lower numbers show first">
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={String(testimonial?.sortOrder ?? 0)}
          />
        </Field>
      </div>
      <Checkbox
        name="active"
        label="Live on website"
        defaultChecked={testimonial?.active ?? true}
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
        <SubmitButton>{testimonial ? "Save Testimonial" : "Add Testimonial"}</SubmitButton>
      </div>
    </form>
  );
}
