"use client";

import { Printer } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <AdminButton
      variant="secondary"
      size="md"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Printer className="h-4 w-4" strokeWidth={1.75} aria-hidden /> {label}
    </AdminButton>
  );
}
