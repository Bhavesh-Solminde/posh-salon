import { cache } from "react";
import { prisma } from "./db";
import { BUSINESS } from "./business";

/**
 * Everything the public homepage renders, read from the same records the salon
 * edits in the admin. The page used to hard-code its services, hours, phone and
 * testimonials, so nothing a manager changed in Settings, Services or Website
 * ever reached a visitor.
 *
 * Three rules hold here:
 *  - Placeholder business details stay visibly unconfirmed rather than becoming
 *    a live link to nowhere (PRODUCT.md: never fabricate business facts).
 *  - Where a detail is still a placeholder in the database, the salon's real,
 *    confirmed values in business.ts are used instead. That is not fabrication:
 *    it is the same fact, committed to the repo so a deploy publishes it without
 *    anyone retyping it into the admin first. Whatever staff save always wins.
 *  - Service terms are shown as "by consultation" until the salon confirms its
 *    catalog pricing; the catalog's names and grouping are truth, its seeded
 *    figures are not.
 */

// Seeded stand-ins the salon has not replaced yet.
const PLACEHOLDER = /to be confirmed|0{5}\s?0{5}|^\s*$/i;

export function isPlaceholder(value?: string | null): boolean {
  return !value || PLACEHOLDER.test(value);
}

/** A value staff actually confirmed, or undefined so a fallback can take over. */
function real(value?: string | null): string | undefined {
  return isPlaceholder(value) ? undefined : value!.trim();
}

/**
 * Digits only, for wa.me. A leading "+" is preserved separately for tel: —
 * dialling "919992279292" without it reads as a local number on an Indian
 * handset, where "+919992279292" is unambiguous.
 */
function digits(value: string) {
  return value.replace(/[^\d]/g, "");
}

function telHref(value: string) {
  return `tel:${value.trim().startsWith("+") ? "+" : ""}${digits(value)}`;
}

export type SiteHour = {
  day: string;
  time: string;
  /** Present only on hours from business.ts; drives schema.org opening hours. */
  days?: string[];
  opens?: string;
  closes?: string;
};

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

  // Staff-saved values win; the repo's confirmed facts cover anything still
  // sitting at its seeded placeholder.
  const phone = real(settings?.phone) ?? BUSINESS.phone;
  const whatsapp = real(settings?.whatsapp) ?? BUSINESS.whatsapp;

  // The address is taken all-or-nothing. Merging the two sources per-field would
  // let a street staff typed for a new location keep the old city beside it, so
  // the moment they save an address of their own, every part comes from them.
  const usingOwnAddress = !real(settings?.addressLine);
  const address = usingOwnAddress ? BUSINESS.addressLine : real(settings?.addressLine)!;
  const city = usingOwnAddress ? BUSINESS.city : (real(settings?.city) ?? "");
  // No Settings column holds these, so they only apply to our own address.
  const state = usingOwnAddress ? BUSINESS.state : "";
  const postalCode = usingOwnAddress ? BUSINESS.postalCode : "";

  const rawHours = Array.isArray(settings?.hoursJson)
    ? (settings.hoursJson as unknown as SiteHour[])
    : [];
  const savedHours = rawHours.filter((h) => h && h.day && !isPlaceholder(h.time));
  const hours: SiteHour[] = savedHours.length > 0 ? savedHours : BUSINESS.hours;

  const fullAddress = [address, city, state && postalCode ? `${state} ${postalCode}` : null]
    .filter((part): part is string => !isPlaceholder(part))
    .join(", ");

  const salonName = settings?.salonName ?? "Posh Salon";

  const salon = {
    name: salonName,
    tagline: settings?.tagline ?? "Premier Hair · Skin · Makeup Atelier",
    phone,
    hasPhone: true,
    telHref: telHref(phone),
    whatsapp,
    hasWhatsapp: true,
    whatsappHref: `https://wa.me/${digits(whatsapp)}`,
    email: settings?.email ?? "",
    hasEmail: !isPlaceholder(settings?.email),
    address,
    city,
    state,
    postalCode,
    fullAddress,
    hasAddress: true,
    // The salon's own Google listing when we're showing its own address,
    // otherwise a search built from whatever staff typed in.
    mapsHref: usingOwnAddress
      ? BUSINESS.mapsUrl
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${salonName} ${fullAddress}`,
        )}`,
    hours,
    hasHours: hours.some((h) => !isPlaceholder(h.time)),
    social: BUSINESS.social,
    hasSocial: true,
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
