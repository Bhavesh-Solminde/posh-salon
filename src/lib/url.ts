import { headers } from "next/headers";
import { SITE_URL } from "./brand";

/**
 * Fixed production domain, from NEXT_PUBLIC_SITE_URL. Use this (not `getOrigin`)
 * for anything that can outlive a single request — a printed card's QR code, for
 * instance — since it must resolve correctly no matter what host the page was
 * viewed from.
 */
export const PRODUCTION_ORIGIN = SITE_URL;

/** Absolute origin for the current request, for links sent outside the app (WhatsApp, email). */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  return `${proto}://${host}`;
}
