"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Check, ShoppingBag, TriangleAlert } from "lucide-react";
import { createInvoice } from "../actions";
import { AdminButton } from "@/components/admin/AdminButton";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import { useToast } from "@/components/admin/ui/Toast";
import {
  computeInvoiceTotals,
  capWalletRedemption,
  formatINR,
  round2,
  type BillLine,
} from "@/lib/money";

type ServiceOpt = { id: string; name: string; price: number };
type ProductOpt = { id: string; name: string; salePrice: number; stock: number };
type CustomerOpt = { id: string; name: string; phone: string; walletBalance: number | null };
type EmployeeOpt = { id: string; name: string };

type CartLine = {
  key: string;
  type: "SERVICE" | "PRODUCT";
  refId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  stock?: number;
  employeeId: string | null;
};

type PaymentRow = { method: "CASH" | "UPI" | "CARD"; amount: number };

let keySeq = 0;
const nextKey = () => `l${++keySeq}`;

/** A zero reads as "already filled in" and has to be cleared before typing —
 *  at a counter that costs a keystroke on every line. Show the placeholder. */
const numValue = (n: number) => (n === 0 ? "" : String(n));

export function POS({
  services,
  products,
  customers,
  employees,
  gstRatePct,
  pricesIncludeGst,
}: {
  services: ServiceOpt[];
  products: ProductOpt[];
  customers: CustomerOpt[];
  employees: EmployeeOpt[];
  gstRatePct: number;
  pricesIncludeGst: boolean;
}) {
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [walletRedeem, setWalletRedeem] = useState(0);
  const [payments, setPayments] = useState<PaymentRow[]>([{ method: "CASH", amount: 0 }]);
  const [gstOn, setGstOn] = useState(true);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<{ number: string; invoiceId: string } | null>(null);

  const customer = customers.find((c) => c.id === customerId) ?? null;
  const walletBalance = customer?.walletBalance ?? 0;

  const totals = useMemo(
    () =>
      computeInvoiceTotals(
        lines.map<BillLine>((l) => ({
          type: l.type,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
          discount: l.discount,
        })),
        { gstRatePct: gstOn ? gstRatePct : 0, pricesIncludeGst },
      ),
    [lines, gstRatePct, gstOn, pricesIncludeGst],
  );

  const maxWallet = Math.min(totals.serviceSubtotal, walletBalance);
  const effWallet = capWalletRedemption(walletRedeem, totals.serviceSubtotal, walletBalance);
  const due = round2(totals.grandTotal - effWallet);
  const paid = round2(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0));
  const balance = round2(due - paid);

  // A product line can't be billed past what's on the shelf — the stock ledger
  // would go negative and the next restock would be wrong.
  const overStock = lines.filter(
    (l) => l.type === "PRODUCT" && l.stock !== undefined && l.quantity > l.stock,
  );
  const overPaid = balance < -0.001;
  const blocked = lines.length === 0 || overStock.length > 0 || overPaid;

  function addService(id: string) {
    const s = services.find((x) => x.id === id);
    if (!s) return;
    setLines((ls) => [
      ...ls,
      { key: nextKey(), type: "SERVICE", refId: s.id, name: s.name, unitPrice: s.price, quantity: 1, discount: 0, employeeId: null },
    ]);
  }
  function addProduct(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setLines((ls) => [
      ...ls,
      { key: nextKey(), type: "PRODUCT", refId: p.id, name: p.name, unitPrice: p.salePrice, quantity: 1, discount: 0, stock: p.stock, employeeId: null },
    ]);
  }
  function updateLine(key: string, patch: Partial<CartLine>) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }
  function removeLine(key: string) {
    setLines((ls) => ls.filter((l) => l.key !== key));
  }

  function submit() {
    if (lines.length === 0) {
      toast("Add at least one service or product before generating an invoice.", "danger");
      return;
    }
    startTransition(async () => {
      const res = await createInvoice({
        customerId: customerId || null,
        lines: lines.map((l) => ({
          type: l.type,
          refId: l.refId,
          name: l.name,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discount: l.discount,
          employeeId: l.employeeId,
        })),
        walletRedeem: effWallet,
        payments: payments.filter((p) => Number(p.amount) > 0),
        gstApplied: gstOn,
      });
      if (res.ok) {
        toast(`Invoice ${res.number} created.`);
        setDone({ number: res.number, invoiceId: res.invoiceId });
      } else {
        toast(res.error, "danger");
      }
    });
  }

  function reset() {
    setCustomerId("");
    setLines([]);
    setWalletRedeem(0);
    setPayments([{ method: "CASH", amount: 0 }]);
    setGstOn(true);
    setDone(null);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-success bg-success-soft text-success">
          <Check className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-5 font-display text-ui-title text-ink">Invoice {done.number}</p>
        <p className="mt-1 text-ui-sm text-ink-muted">
          Payment recorded and the ledger updated.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href={`/admin/billing/${done.invoiceId}`}>
            <AdminButton variant="secondary">View / Print</AdminButton>
          </Link>
          <AdminButton variant="primary" onClick={reset}>
            New Bill
          </AdminButton>
        </div>
      </div>
    );
  }

  const controlSm =
    "h-9 border border-warm-line bg-warm-white px-2 text-ui-sm text-ink transition-colors duration-150 focus:border-gold-shadow focus:outline-none";
  const numberCell = `${controlSm} text-right tabular-nums`;

  return (
    <div className="grid items-start gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_360px]">
      {/* Left: customer + items */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[15rem] flex-1">
            <label htmlFor="pos-customer" className="text-meta uppercase text-ink-muted">
              Customer
            </label>
            <div className="mt-1.5">
              <SearchableSelect
                id="pos-customer"
                value={customerId}
                onChange={(id) => {
                  setCustomerId(id);
                  setWalletRedeem(0);
                }}
                placeholder="Walk-in (no record)"
                className={`${controlSm} w-full`}
                options={customers.map((c) => ({
                  id: c.id,
                  label: `${c.name} · ${c.phone}${c.walletBalance ? ` · wallet ${formatINR(c.walletBalance)}` : ""}`,
                }))}
              />
            </div>
          </div>
          {customer && walletBalance > 0 ? (
            <div className="pb-1.5">
              <StatusChip tone="success">Wallet {formatINR(walletBalance)}</StatusChip>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="min-w-[13rem] flex-1">
            <label htmlFor="pos-service" className="text-meta uppercase text-ink-muted">
              Add service
            </label>
            <div className="mt-1.5">
              <SearchableSelect
                id="pos-service"
                value=""
                onChange={addService}
                clearOnSelect
                placeholder="Choose a service…"
                className={`${controlSm} w-full`}
                options={services.map((s) => ({ id: s.id, label: `${s.name} — ${formatINR(s.price)}` }))}
              />
            </div>
          </div>
          <div className="min-w-[13rem] flex-1">
            <label htmlFor="pos-product" className="text-meta uppercase text-ink-muted">
              Add product
            </label>
            <div className="mt-1.5">
              <SearchableSelect
                id="pos-product"
                value=""
                onChange={addProduct}
                clearOnSelect
                placeholder="Choose a product…"
                className={`${controlSm} w-full`}
                options={products.map((p) => ({
                  id: p.id,
                  label: `${p.name} — ${formatINR(p.salePrice)}${p.stock > 0 ? ` (${p.stock} in stock)` : " (out of stock)"}`,
                  disabled: p.stock <= 0,
                }))}
              />
            </div>
          </div>
        </div>

        <div className="border border-warm-line">
          {lines.length === 0 ? (
            <EmptyState
              compact
              icon={ShoppingBag}
              title="Nothing on this bill yet"
              message="Add the services performed and any products the client is taking home."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-ui-sm">
                <caption className="sr-only">Items on this bill</caption>
                <thead>
                  <tr className="border-b border-warm-line">
                    <th scope="col" className="px-3 py-2 text-left text-meta uppercase text-ink-muted">
                      Item
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-meta uppercase text-ink-muted">
                      Employee
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-meta uppercase text-ink-muted">
                      Price
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-meta uppercase text-ink-muted">
                      Qty
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-meta uppercase text-ink-muted">
                      Discount
                    </th>
                    <th scope="col" className="px-3 py-2 text-right text-meta uppercase text-ink-muted">
                      Total
                    </th>
                    <th scope="col" className="px-3 py-2">
                      <span className="sr-only">Remove</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => {
                    const short = l.stock !== undefined && l.quantity > l.stock;
                    return (
                      <tr key={l.key} className="border-b border-warm-line/70 last:border-0">
                        <td className="px-3 py-2 text-ink">
                          <span className="font-medium">{l.name}</span>
                          <span className="ml-2 text-ui-sm text-ink-muted">
                            {l.type === "SERVICE" ? "Service" : "Product"}
                          </span>
                          {short && (
                            <span className="mt-0.5 flex items-center gap-1 text-ui-sm text-danger">
                              <TriangleAlert className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                              Only {l.stock} in stock
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <SearchableSelect
                            value={l.employeeId ?? ""}
                            onChange={(id) => updateLine(l.key, { employeeId: id || null })}
                            placeholder="Unassigned"
                            className={`${controlSm} w-40`}
                            aria-label={`Employee for ${l.name}`}
                            options={employees.map((e) => ({ id: e.id, label: e.name }))}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            value={l.unitPrice}
                            onChange={(e) =>
                              updateLine(l.key, { unitPrice: Math.max(0, Number(e.target.value)) })
                            }
                            className={`${numberCell} w-24`}
                            aria-label={`Price for ${l.name}`}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min={1}
                            value={l.quantity}
                            onChange={(e) =>
                              updateLine(l.key, { quantity: Math.max(1, Number(e.target.value)) })
                            }
                            className={`${numberCell} w-16 ${short ? "border-danger" : ""}`}
                            aria-label={`Quantity for ${l.name}`}
                            aria-invalid={short || undefined}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={numValue(l.discount)}
                            placeholder="0"
                            onChange={(e) =>
                              updateLine(l.key, { discount: Math.max(0, Number(e.target.value)) })
                            }
                            className={`${numberCell} w-20`}
                            aria-label={`Discount in rupees for ${l.name}`}
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums text-ink">
                          {formatINR(round2(l.unitPrice * l.quantity - l.discount))}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <AdminButton
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${l.name}`}
                            onClick={() => removeLine(l.key)}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                          </AdminButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={reset}
              className="text-ui-sm text-ink-muted underline decoration-warm-line underline-offset-4 transition-colors duration-150 hover:text-danger"
            >
              Clear this bill
            </button>
          </div>
        )}
      </div>

      {/* Right: totals + payment. Sticks alongside a long cart so the amount due
          and the commit button never scroll out of reach. */}
      <div className="space-y-4 border border-warm-line bg-warm-panel p-5 lg:sticky lg:top-[5.5rem]">
        <Row label="Services" value={formatINR(totals.serviceSubtotal)} />
        <Row label="Products" value={formatINR(totals.productSubtotal)} />
        {totals.discountTotal > 0 && (
          <Row label="Discounts" value={`− ${formatINR(totals.discountTotal)}`} />
        )}
        <div className="flex items-center justify-between gap-4">
          <span className="text-ui-sm text-ink-muted">
            GST {gstOn ? `(${gstRatePct}%)` : "(off)"}
          </span>
          <div className="flex items-center gap-2">
            <span className="tabular-nums text-ui-sm text-ink-muted">
              {formatINR(totals.taxTotal)}
            </span>
            <button
              type="button"
              onClick={() => setGstOn((v) => !v)}
              className="text-ui-sm text-gold-shadow transition-colors duration-150 hover:text-ink hover:underline"
            >
              {gstOn ? "Turn off" : "Turn on"}
            </button>
          </div>
        </div>
        <div className="border-t border-warm-line pt-3">
          <Row label="Grand Total" value={formatINR(totals.grandTotal)} strong />
        </div>

        {customer && walletBalance > 0 && (
          <div className="border-t border-warm-line pt-3">
            <label htmlFor="wallet" className="text-meta uppercase text-ink-muted">
              Redeem wallet
            </label>
            <p className="mt-0.5 text-ui-sm text-ink-muted">
              Services only · up to {formatINR(maxWallet)}
            </p>
            <div className="mt-1.5 flex gap-2">
              <input
                id="wallet"
                type="number"
                min={0}
                max={maxWallet}
                step="0.01"
                value={numValue(walletRedeem)}
                placeholder="0"
                onChange={(e) =>
                  // Clamp on entry: a figure above the cap would otherwise stay on
                  // screen while a different, smaller amount was actually applied.
                  setWalletRedeem(
                    Math.min(maxWallet, Math.max(0, Number(e.target.value) || 0)),
                  )
                }
                className={`${numberCell} w-full`}
              />
              <AdminButton
                variant="secondary"
                onClick={() => setWalletRedeem(maxWallet)}
                disabled={maxWallet <= 0}
              >
                Max
              </AdminButton>
            </div>
            {effWallet > 0 && (
              <p className="mt-1.5 text-ui-sm text-success">
                − {formatINR(effWallet)} from wallet
              </p>
            )}
          </div>
        )}

        <div className="border-t border-warm-line pt-3">
          <Row label="Amount Due" value={formatINR(due)} strong />
        </div>

        {/* Payments */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-meta uppercase text-ink-muted">Payment</span>
            <button
              type="button"
              className="text-ui-sm text-gold-shadow transition-colors duration-150 hover:text-ink hover:underline"
              onClick={() => setPayments((p) => [...p, { method: "CASH", amount: 0 }])}
            >
              + Split
            </button>
          </div>
          {payments.map((p, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={p.method}
                onChange={(e) =>
                  setPayments((ps) =>
                    ps.map((x, j) =>
                      j === i ? { ...x, method: e.target.value as PaymentRow["method"] } : x,
                    ),
                  )
                }
                className={controlSm}
                aria-label={`Payment ${i + 1} method`}
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
              </select>
              <input
                type="number"
                min={0}
                step="0.01"
                value={numValue(p.amount)}
                placeholder="0.00"
                onChange={(e) =>
                  setPayments((ps) =>
                    ps.map((x, j) =>
                      j === i ? { ...x, amount: Math.max(0, Number(e.target.value) || 0) } : x,
                    ),
                  )
                }
                className={`${numberCell} w-full`}
                aria-label={`Payment ${i + 1} amount`}
              />
              {i === 0 ? (
                <AdminButton
                  variant="secondary"
                  onClick={() =>
                    setPayments((ps) => ps.map((x, j) => (j === 0 ? { ...x, amount: due } : x)))
                  }
                  disabled={due <= 0}
                >
                  Full
                </AdminButton>
              ) : (
                <AdminButton
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove payment ${i + 1}`}
                  onClick={() => setPayments((ps) => ps.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </AdminButton>
              )}
            </div>
          ))}
          <Row label="Paid" value={formatINR(paid)} />
          {lines.length === 0 || balance > 0.001 ? (
            <Row label="Balance" value={formatINR(Math.max(0, balance))} muted />
          ) : (
            <Row label="Settled" value={formatINR(0)} muted />
          )}
        </div>

        {overStock.length > 0 && (
          <p className="text-ui-sm text-danger" role="alert">
            Reduce the quantity on {overStock.map((l) => l.name).join(", ")} — the shelf
            doesn&rsquo;t have that many.
          </p>
        )}
        {overPaid && (
          <p className="text-ui-sm text-danger" role="alert">
            Payment is {formatINR(Math.abs(balance))} more than the amount due. Collect the
            exact amount and hand back the change.
          </p>
        )}

        <AdminButton
          variant="primary"
          size="lg"
          className="w-full"
          disabled={pending || blocked}
          onClick={submit}
        >
          {pending ? "Processing…" : "Generate Invoice"}
        </AdminButton>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`text-ui-sm ${muted ? "text-ink-muted" : "text-ink"}`}>{label}</span>
      <span
        className={`tabular-nums ${
          strong
            ? "text-ui-lg font-medium text-ink"
            : muted
              ? "text-ui-sm text-ink-muted"
              : "text-ui-sm text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
