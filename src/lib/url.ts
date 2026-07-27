import { headers } from "next/headers";

/** Absolute origin for the current request, for links sent outside the app (WhatsApp, email). */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  return `${proto}://${host}`;
}
