import { headers } from "next/headers";

/**
 * Fixed production domain. Use this (not `getOrigin`) for anything that can
 * outlive a single request — a printed card's QR code, for instance — since
 * it must resolve correctly no matter what host the page was viewed from.
 */
export const PRODUCTION_ORIGIN = "https://www.poshsalon.co.in";

/** Absolute origin for the current request, for links sent outside the app (WhatsApp, email). */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  return `${proto}://${host}`;
}
