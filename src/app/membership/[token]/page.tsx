import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PrintButton } from "@/components/admin/ui/PrintButton";
import { MembershipCardPanel } from "@/components/MembershipCardPanel";

export const metadata: Metadata = {
  title: "Membership card · Posh Salon",
  // Reachable only via a direct link sent to the customer, not for search indexes.
  robots: { index: false, follow: false },
};

export default async function PublicMembershipPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const membership = await prisma.membership.findFirst({
    where: { qrToken: token, deletedAt: null },
    include: { customer: true, plan: true },
  });
  if (!membership) notFound();

  return (
    <div className="print-page mx-auto max-w-lg p-4 sm:p-6">
      <div className="flex justify-end pb-4 print:hidden">
        <PrintButton label="Print / Save as PDF" />
      </div>
      <MembershipCardPanel membership={membership} />
    </div>
  );
}
