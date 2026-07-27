import { getSessionUser } from "@/lib/session";
import { loadLedger } from "../_lib";

const CAT_LABEL: Record<string, string> = {
  MEMBERSHIP_SALE: "Membership", PRODUCT_SALE: "Product sale", SERVICE_SALE: "Service sale",
  SUPPLIER_PURCHASE: "Supplier", MISC_EXPENSE: "Misc",
};

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const g = (k: string) => url.searchParams.get(k) ?? undefined;
  const rows = await loadLedger({ type: g("type"), category: g("category"), from: g("from"), to: g("to"), q: g("q") });

  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = [
    "Date,Type,Category,Description,Amount",
    ...rows.map((r) =>
      [
        r.occurredAt.toISOString().slice(0, 10),
        r.type,
        CAT_LABEL[r.category] ?? r.category,
        esc(r.description ?? ""),
        Number(r.amount).toFixed(2),
      ].join(","),
    ),
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="billing-history.csv"',
    },
  });
}
