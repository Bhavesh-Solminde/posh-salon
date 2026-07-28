import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { POS } from "./_components/POS";

export default async function BillingPage() {
  await requireStaff();
  const [services, products, customers, employees, settings] = await Promise.all([
    prisma.service.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { deletedAt: null, isActive: true, use: { in: ["RETAIL", "BOTH"] } },
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      take: 500,
      include: { memberships: { where: { deletedAt: null, status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    prisma.employee.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.settings.findUniqueOrThrow({ where: { id: "singleton" } }),
  ]);

  return (
    <div>
      <PageHeader title="Billing" description="Ring up services and products, redeem wallet against services, and take payment." />
      <POS
        gstRatePct={Number(settings.gstRatePct)}
        pricesIncludeGst={settings.pricesIncludeGst}
        services={services.map((s) => ({ id: s.id, name: s.name, price: Number(s.price) }))}
        products={products.map((p) => ({ id: p.id, name: p.name, salePrice: Number(p.salePrice), stock: p.stock }))}
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          walletBalance: c.memberships[0] ? Number(c.memberships[0].balance) : null,
        }))}
        employees={employees.map((e) => ({ id: e.id, name: e.name }))}
      />
    </div>
  );
}
