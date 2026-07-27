"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus, Package, Boxes } from "lucide-react";
import { saveProduct, deleteProduct, recordStock } from "../actions";
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

export type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  use: "RETAIL" | "IN_SALON" | "BOTH";
  salePrice: number;
  costPrice: number;
  stock: number;
  reorderLevel: number;
  isActive: boolean;
};

const USE_LABEL = { RETAIL: "Retail", IN_SALON: "In-salon", BOTH: "Both" } as const;

export function ProductsManager({ products }: { products: ProductRow[] }) {
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [stockFor, setStockFor] = useState<ProductRow | null>(null);

  const newButton = (
    <AdminButton
      variant="primary"
      onClick={() => {
        setEditing(null);
        setEditOpen(true);
      }}
    >
      <Plus className="h-4 w-4" strokeWidth={2} aria-hidden /> Add Product
    </AdminButton>
  );

  const columns: Column<ProductRow>[] = [
    {
      key: "name",
      header: "Product",
      cell: (p) => (
        <div>
          <span className="font-medium text-ink">{p.name}</span>
          {!p.isActive && (
            <span className="ml-2 text-ui-sm text-ink-muted">Inactive</span>
          )}
          {p.sku && <p className="mt-0.5 text-ui-sm text-ink-muted">{p.sku}</p>}
        </div>
      ),
    },
    {
      key: "use",
      header: "Use",
      hideOnMobile: true,
      cell: (p) => <StatusChip tone="neutral">{USE_LABEL[p.use]}</StatusChip>,
    },
    { key: "sale", header: "Sale", align: "right", cell: (p) => formatINR(p.salePrice) },
    {
      key: "cost",
      header: "Cost",
      align: "right",
      hideOnMobile: true,
      cell: (p) => <span className="text-ink-muted">{formatINR(p.costPrice)}</span>,
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      cell: (p) =>
        p.stock <= p.reorderLevel ? (
          <StatusChip tone={p.stock <= 0 ? "danger" : "warning"}>
            {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
          </StatusChip>
        ) : (
          <span className="tabular-nums">{p.stock}</span>
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
            aria-label={`Record stock movement for ${p.name}`}
            onClick={() => setStockFor(p)}
          >
            <Boxes className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </AdminButton>
          <AdminButton
            variant="ghost"
            size="icon"
            aria-label={`Edit ${p.name}`}
            onClick={() => {
              setEditing(p);
              setEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </AdminButton>
          <DeleteButton
            action={deleteProduct.bind(null, p.id)}
            label={`Remove ${p.name}`}
            title="Remove product"
            confirm={`Remove ${p.name} from the catalog?`}
          >
            It stops appearing in billing. Past sales and stock movements stay in the
            ledger.
          </DeleteButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PanelHeader
        title="Stock List"
        description={
          products.length > 0
            ? `${products.length} product${products.length === 1 ? "" : "s"} tracked`
            : undefined
        }
        actions={newButton}
      />
      <DataTable
        caption="Products and stock levels"
        columns={columns}
        rows={products}
        getRowKey={(p) => p.id}
        empty={
          <EmptyState
            icon={Package}
            title="No products yet"
            message="Add retail and in-salon products to track stock and sell them on invoices."
            action={newButton}
          />
        }
      />

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={editing ? "Edit Product" : "New Product"}
      >
        <ProductForm product={editing} onDone={() => setEditOpen(false)} />
      </Modal>
      <Modal
        open={stockFor !== null}
        onClose={() => setStockFor(null)}
        title={`Stock — ${stockFor?.name ?? ""}`}
      >
        {stockFor && <StockForm product={stockFor} onDone={() => setStockFor(null)} />}
      </Modal>
    </div>
  );
}

function ProductForm({ product, onDone }: { product: ProductRow | null; onDone: () => void }) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(saveProduct, { ok: false });
  useEffect(() => {
    if (state.ok) {
      toast(state.message ?? "Saved.");
      onDone();
    }
  }, [state, toast, onDone]);
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={fe.name}>
          <Input id="name" name="name" defaultValue={product?.name ?? ""} />
        </Field>
        <Field label="SKU" htmlFor="sku">
          <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} />
        </Field>
        <Field label="Category" htmlFor="category">
          <Input id="category" name="category" defaultValue={product?.category ?? ""} />
        </Field>
        <Field label="Use" htmlFor="use">
          <Select id="use" name="use" defaultValue={product?.use ?? "RETAIL"}>
            <option value="RETAIL">Retail (sold to customers)</option>
            <option value="IN_SALON">In-salon (used during services)</option>
            <option value="BOTH">Both</option>
          </Select>
        </Field>
        <Field label="Sale Price ₹" htmlFor="salePrice" required error={fe.salePrice}>
          <Input id="salePrice" name="salePrice" type="number" step="0.01" min={0} defaultValue={product?.salePrice ?? 0} />
        </Field>
        <Field label="Cost Price ₹" htmlFor="costPrice" error={fe.costPrice}>
          <Input id="costPrice" name="costPrice" type="number" step="0.01" min={0} defaultValue={product?.costPrice ?? 0} />
        </Field>
        <Field
          label="Reorder Level"
          htmlFor="reorderLevel"
          hint="Warn when stock drops to this number"
          error={fe.reorderLevel}
        >
          <Input id="reorderLevel" name="reorderLevel" type="number" min={0} defaultValue={product?.reorderLevel ?? 0} />
        </Field>
      </div>
      <Checkbox
        name="isActive"
        label="Active"
        defaultChecked={product?.isActive ?? true}
        hint="Inactive products stay in reports but can't be added to a bill."
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
        <SubmitButton>{product ? "Save Product" : "Create Product"}</SubmitButton>
      </div>
    </form>
  );
}

function StockForm({ product, onDone }: { product: ProductRow; onDone: () => void }) {
  const { toast } = useToast();
  const [state, action] = useActionState<ActionResult, FormData>(recordStock, { ok: false });
  useEffect(() => {
    if (state.ok) {
      toast(state.message ?? "Stock updated.");
      onDone();
    }
  }, [state, toast, onDone]);
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="productId" value={product.id} />
      <p className="text-ui-sm text-ink-muted">
        Current stock:{" "}
        <span className="font-medium tabular-nums text-ink">{product.stock}</span>
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Movement" htmlFor="type">
          <Select id="type" name="type" defaultValue="PURCHASE">
            <option value="PURCHASE">Restock (supplier purchase)</option>
            <option value="ADJUSTMENT">Adjustment (recount / wastage)</option>
          </Select>
        </Field>
        <Field
          label="Quantity"
          htmlFor="quantity"
          required
          error={fe.quantity}
          hint="Adjustments may be negative"
        >
          <Input id="quantity" name="quantity" type="number" defaultValue={1} />
        </Field>
        <Field
          label="Unit Cost ₹"
          htmlFor="unitCost"
          hint="Restock only — posts an expense"
          error={fe.unitCost}
        >
          <Input
            id="unitCost"
            name="unitCost"
            type="number"
            step="0.01"
            min={0}
            defaultValue={product.costPrice}
          />
        </Field>
      </div>
      <Field label="Note" htmlFor="note">
        <Input id="note" name="note" placeholder="e.g. Supplier invoice #" />
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
        <SubmitButton>Record Movement</SubmitButton>
      </div>
    </form>
  );
}
