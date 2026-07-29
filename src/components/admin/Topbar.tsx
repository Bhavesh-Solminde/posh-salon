"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Plus, LogOut } from "lucide-react";
import { AdminButton } from "./AdminButton";
import { signOut } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/roles";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_LABEL: Record<SessionUser["role"], string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  CASHIER: "Cashier",
};

export function Topbar({
  user,
  onOpenDrawer,
}: {
  user: SessionUser;
  onOpenDrawer: () => void;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header
      style={{ top: "var(--demo-bar-h, 0px)" }}
      className="sticky z-30 flex h-16 shrink-0 items-center gap-3 border-b border-warm-line bg-warm-white px-4 print:hidden"
    >
      <AdminButton
        variant="ghost"
        size="icon"
        onClick={onOpenDrawer}
        aria-label="Open navigation"
        className="md:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </AdminButton>

      {/* Customer lookup — the front desk's most-used action, so it submits
          straight into the Customers search rather than sitting inert. */}
      <form
        action="/admin/customers"
        method="get"
        role="search"
        className="relative hidden max-w-md flex-1 items-center sm:flex"
      >
        <label htmlFor="global-search" className="sr-only">
          Search customers by name, phone, membership ID, or QR
        </label>
        <Search
          className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          id="global-search"
          type="search"
          name="q"
          placeholder="Search by name, phone, membership ID, or QR"
          className="h-9 w-full border border-warm-line bg-warm-white pl-9 pr-3 text-ui-sm text-ink transition-colors duration-150 placeholder:text-ink-muted focus:border-gold-shadow focus:outline-none"
        />
      </form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <AdminButton
          variant="primary"
          size="md"
          aria-label="New Invoice"
          onClick={() => router.push("/admin/billing")}
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          <span className="hidden sm:inline">New Invoice</span>
        </AdminButton>

        <div className="flex items-center gap-2.5 border-l border-warm-line pl-2 sm:pl-3">
          <span className="sr-only">
            Signed in as {user.name}, {ROLE_LABEL[user.role]}
          </span>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center bg-warm-panel text-ui-sm font-medium text-gold-shadow ring-1 ring-warm-line"
            aria-hidden
          >
            {initials(user.name)}
          </span>
          <span className="hidden leading-tight lg:block" aria-hidden>
            <span className="block text-ui-sm text-ink">{user.name}</span>
            <span className="block text-meta uppercase text-ink-muted">
              {ROLE_LABEL[user.role]}
            </span>
          </span>
          <AdminButton
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label={signingOut ? "Signing out…" : "Sign out"}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </AdminButton>
        </div>
      </div>
    </header>
  );
}
