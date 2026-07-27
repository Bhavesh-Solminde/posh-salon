import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { roleAtLeast, type SessionUser, type StaffRole } from "./roles";

export type { SessionUser, StaffRole };

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const u = session.user as unknown as SessionUser;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u.role as StaffRole) ?? "CASHIER",
    isActive: u.isActive ?? true,
  };
}

/** Server-side gate for admin pages. Redirects to login when unauthenticated. */
export async function requireStaff(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || !user.isActive) redirect("/admin/login");
  return user;
}

/** Require a minimum role; bounces lower roles back to the dashboard. */
export async function requireRole(min: StaffRole): Promise<SessionUser> {
  const user = await requireStaff();
  if (!roleAtLeast(user.role, min)) redirect("/admin/dashboard");
  return user;
}
