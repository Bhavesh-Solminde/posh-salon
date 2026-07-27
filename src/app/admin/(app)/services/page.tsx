import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { ServicesManager } from "./_components/ServicesManager";
import { CategoriesManager } from "./_components/CategoriesManager";

export default async function ServicesPage() {
  await requireStaff();
  const [services, categories] = await Promise.all([
    prisma.service.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    }),
    prisma.serviceCategory.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Services"
        description="The service catalog that feeds both billing and the public service pages."
      />
      <div className="space-y-6 p-4 sm:p-6">
        <Panel>
          <CategoriesManager categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
        </Panel>
        <Panel>
          <ServicesManager
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              categoryId: s.categoryId,
              categoryName: s.category?.name ?? null,
              durationMin: s.durationMin,
              price: Number(s.price),
              description: s.description,
              isActive: s.isActive,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
