// Pure, client-safe role helpers (no server imports) so both middleware/server
// gates and client components can share one source of truth.

export type StaffRole = "ADMIN" | "MANAGER" | "CASHIER";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
};

const RANK: Record<StaffRole, number> = { CASHIER: 1, MANAGER: 2, ADMIN: 3 };

export function roleAtLeast(role: StaffRole | undefined, min: StaffRole): boolean {
  return RANK[role ?? "CASHIER"] >= RANK[min];
}

/** Nav visibility: item.role "all" | "manager" | "admin" vs the user's role. */
export function canSeeNav(
  role: StaffRole,
  itemRole: "all" | "manager" | "admin",
): boolean {
  if (itemRole === "all") return true;
  return roleAtLeast(role, itemRole === "admin" ? "ADMIN" : "MANAGER");
}
