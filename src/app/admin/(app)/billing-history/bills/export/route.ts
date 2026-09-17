import { getSessionUser } from "@/lib/session";
import { loadRegister, parseMonth, parseView, registerTotals } from "../_lib";

const STATUS_LABEL: Record<string, string> = { PAID: "Paid", PARTIAL: "Part-paid", VOID: "Void" };

// One month of one register, in the shape an accountant files from: the same
// 1…n numbering as the screen, and a closing totals row (void bills excluded).
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const month = parseMonth(url.searchParams.get("month") ?? undefined);
  const view = parseView(url.searchParams.get("view") ?? undefined);
  const { rows } = await loadRegister(month, view);
  const t = registerTotals(rows);

  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const n = (v: number) => v.toFixed(2);
  const ist = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD

  const lines =
    view === "gst"
      ? [
          "No.,Date,Bill no.,Customer,Phone,Taxable value,CGST,SGST,Total GST,Bill total,Status",
          ...rows.map((r) =>
            [r.serial, ist(r.date), r.number, esc(r.customer ?? "Walk-in"), r.phone ?? "",
              n(r.taxable), n(r.cgst), n(r.sgst), n(r.tax), n(r.total), STATUS_LABEL[r.status]].join(","),
          ),
          ["", "", "", esc(`Month total (${t.count} bills)`), "",
            n(t.taxable), n(t.cgst), n(t.sgst), n(t.tax), n(t.total), ""].join(","),
        ]
      : [
          "No.,Date,Bill no.,Customer,Phone,Paid by,Paid,Due,Bill total,Status",
          ...rows.map((r) =>
            [r.serial, ist(r.date), r.number, esc(r.customer ?? "Walk-in"), r.phone ?? "",
              r.method ?? "", n(r.paid), n(r.due), n(r.total), STATUS_LABEL[r.status]].join(","),
          ),
          ["", "", "", esc(`Month total (${t.count} bills)`), "", "",
            n(t.paid), n(t.due), n(t.total), ""].join(","),
        ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${view}-bills-${month}.csv"`,
    },
  });
}
