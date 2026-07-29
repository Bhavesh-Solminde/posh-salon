import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireStaff } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin · Posh Salon",
  // Staff-only tool — keep it out of search indexes.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();
  return <AdminShell user={user}>{children}</AdminShell>;
}
