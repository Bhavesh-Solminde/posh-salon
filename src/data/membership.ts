export type TierKey = "SILVER" | "GOLD" | "PLATINUM" | "CUSTOM";

export type TierCopy = {
  mark: string;
  description: string;
  example?: string;
  featured?: boolean;
};

/**
 * The salon's plans live in the database (admin → Settings → Membership Plans);
 * this is only the marketing voice for each tier. Prices, validity and bonus
 * percentages are deliberately absent — the one worked example below is the one
 * the owner gave directly, and it stays labelled as illustrative.
 */
export const TIER_COPY: Record<TierKey, TierCopy> = {
  SILVER: {
    mark: "S",
    description:
      "An introduction to the wallet. Load a balance, redeem it against any service at your own pace.",
  },
  GOLD: {
    mark: "G",
    description:
      "Our most extended privilege. Your wallet is worth more than you place into it — value applies to services only.",
    example: "Illustrative example — place ₹5,000, enjoy ₹7,000 in services",
    featured: true,
  },
  PLATINUM: {
    mark: "P",
    description:
      "The fullest expression of membership, with priority booking and our most generous wallet standing.",
  },
  CUSTOM: {
    mark: "C",
    description: "Arranged privately, in consultation with the salon.",
  },
};

/** Shown when the salon has no active plans yet — the mechanism, without tiers. */
export const MEMBERSHIP_FALLBACK =
  "Membership is being arranged. Ask the front desk how the services-only wallet works and what it can hold for you.";
