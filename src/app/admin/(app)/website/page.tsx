import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Panel } from "@/components/admin/ui/Panel";
import { WebsiteManager } from "./_components/WebsiteManager";

export default async function WebsitePage() {
  await requireRole("MANAGER");

  const [offers, testimonials] = await Promise.all([
    prisma.offer.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.testimonial.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Website"
        description="Manage the offers and testimonials shown to clients."
      />
      <div className="p-4 sm:p-6">
        <Panel>
          <WebsiteManager
            offers={offers.map((o) => ({
              id: o.id, title: o.title, description: o.description, badge: o.badge,
              active: o.active, sortOrder: o.sortOrder,
            }))}
            testimonials={testimonials.map((t) => ({
              id: t.id, author: t.author, role: t.role, quote: t.quote,
              rating: t.rating, active: t.active, sortOrder: t.sortOrder,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
