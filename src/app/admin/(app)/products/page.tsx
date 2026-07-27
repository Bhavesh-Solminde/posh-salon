import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { Notice } from "@/components/admin/ui/Notice";
import { ProductsManager } from "./_components/ProductsManager";

export default async function ProductsPage() {
  await requireStaff();
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  const low = products.filter((p) => p.stock <= p.reorderLevel);

  return (
    <div>
      <PageHeader
        title="Products & Inventory"
        description="Retail and in-salon stock with restock records and low-stock alerts."
      />
      <div className="space-y-6 p-4 sm:p-6">
        {/* A standing condition belongs in the page, not swapped into the
            description where it would quietly replace what the screen is for. */}
        {low.length > 0 && (
          <Notice tone="warning">
            {low.length === 1
              ? `${low[0].name} is at or below its reorder level.`
              : `${low.length} products are at or below their reorder level: ${low
                  .slice(0, 3)
                  .map((p) => p.name)
                  .join(", ")}${low.length > 3 ? `, and ${low.length - 3} more` : ""}.`}
          </Notice>
        )}
        <Panel>
          <ProductsManager
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              category: p.category,
              use: p.use,
              salePrice: Number(p.salePrice),
              costPrice: Number(p.costPrice),
              stock: p.stock,
              reorderLevel: p.reorderLevel,
              isActive: p.isActive,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
