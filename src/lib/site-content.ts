import { cache } from "react";
import { prisma } from "./db";

/**
 * Everything the public homepage renders, read from the same records the salon
 * edits in the admin. The page used to hard-code its services, hours, phone and
 * testimonials, so nothing a manager changed in Settings, Services or Website
 * ever reached a visitor.
 *
 * Two rules hold here:
 *  - Placeholder business details stay visibly unconfirmed rather than becoming
 *    a live link to nowhere (PRODUCT.md: never fabricate business facts).
 *  - Service terms are shown as "by consultation" until the salon confirms its
 *    catalog pricing; the catalog's names and grouping are truth, its seeded
 *    figures are not.
 */

// Seeded stand-ins the salon has not replaced yet.
const PLACEHOLDER = /to be confirmed|0{5}\s?0{5}|^\s*$/i;

export function isPlaceholder(value?: string | null): boolean {
  return !value || PLACEHOLDER.test(value);
}

/** Digits only, for tel: and wa.me links. */
function digits(value: string) {
  return value.replace(/[^\d]/g, "");
}

export type SiteHour = { day: string; time: string };

export type SiteContent = Awaited<ReturnType<typeof loadSiteContent>>;

async function loadSiteContent() {
  const [settings, categories, services, offers, testimonials, plans] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "singleton" } }),
    prisma.serviceCategory.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.service.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      include: { category: true },
    }),
    prisma.offer.findMany({
      where: { deletedAt: null, active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.testimonial.findMany({
      where: { deletedAt: null, active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.membershipPlan.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { price: "asc" },
    }),
  ]);

  const phone = settings?.phone ?? "";
  const whatsapp = settings?.whatsapp ?? "";
  const address = settings?.addressLine ?? "";
  const city = settings?.city ?? "";
  const hasPhone = !isPlaceholder(phone);
  const hasWhatsapp = !isPlaceholder(whatsapp);
  const hasAddress = !isPlaceholder(address);

  const rawHours = Array.isArray(settings?.hoursJson)
    ? (settings.hoursJson as unknown as SiteHour[])
    : [];
  const hours = rawHours.filter((h) => h && h.day);

  const fullAddress = [address, city].filter((part) => !isPlaceholder(part)).join(", ");

  const salon = {
    name: settings?.salonName ?? "Posh Salon",
    tagline: settings?.tagline ?? "Premier Hair · Skin · Makeup Atelier",
    phone,
    hasPhone,
    telHref: hasPhone ? `tel:${digits(phone)}` : null,
    whatsapp,
    hasWhatsapp,
    whatsappHref: hasWhatsapp ? `https://wa.me/${digits(whatsapp)}` : null,
    email: settings?.email ?? "",
    hasEmail: !isPlaceholder(settings?.email),
    address,
    city,
    fullAddress,
    hasAddress,
    mapsHref: hasAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${settings?.salonName ?? "Posh Salon"} ${fullAddress}`,
        )}`
      : null,
    hours,
    hasHours: hours.some((h) => !isPlaceholder(h.time)),
  };

  // Roman numerals keep the printed-programme device the landing is built on.
  const numeral = (n: number) =>
    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][n] ??
    String(n + 1);

  return {
    salon,
    categories: categories.map((c) => c.name),
    services: services.map((s, i) => ({
      id: s.id,
      no: numeral(i),
      name: s.name,
      category: s.category?.name ?? null,
      // Only the salon's own words. Prices and durations exist in the catalog
      // but are not published here — PRODUCT.md holds them unconfirmed, and the
      // section states "terms by consultation" once, not per row.
      note: s.description?.trim() || null,
    })),
    offers: offers.map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      badge: o.badge,
    })),
    testimonials: testimonials.map((t) => ({
      id: t.id,
      author: t.author,
      role: t.role,
      quote: t.quote,
      rating: t.rating,
    })),
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      tier: p.tier as "SILVER" | "GOLD" | "PLATINUM" | "CUSTOM",
    })),
  };
}

/** Deduped per request. */
export const getSiteContent = cache(loadSiteContent);
