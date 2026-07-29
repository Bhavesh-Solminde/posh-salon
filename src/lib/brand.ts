/**
 * Brand and origin constants for the demo build.
 *
 * Deliberately free of server-only imports (`next/headers` and friends) so the
 * client components that render the wordmark — the site header, the admin
 * sidebar, the staff sign-in — can import it too. `url.ts` is the server-side
 * counterpart and derives its origin from here.
 *
 * The salon name a visitor sees comes from Settings in the database; these are
 * the fallbacks used before that record exists, plus the values baked into
 * metadata that cannot wait on a database read.
 */

export const BRAND_NAME = "Solminde Studio";

export const BRAND_TAGLINE = "Premier Hair · Skin · Makeup Atelier";

/** The seal, served from `public/`. */
export const BRAND_SEAL = "/solminde-seal.png";

/**
 * Set on the host at deploy time, alongside DATABASE_URL. Localhost is the
 * fallback so a checkout with no env still builds and renders sane links
 * rather than pointing at somebody else's domain.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
