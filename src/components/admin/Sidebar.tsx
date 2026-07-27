"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Seal } from "@/components/ui/Seal";
import { adminNav } from "@/data/adminNav";
import { canSeeNav, type StaffRole } from "@/lib/roles";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * The rail's contents — reused by both the persistent desktop sidebar and the
 * mobile drawer. In "rail" mode labels collapse to icons below the `lg`
 * breakpoint; in "drawer" mode labels always show. Items are filtered by role.
 */
export function SidebarContent({
  mode,
  role,
  onNavigate,
}: {
  mode: "rail" | "drawer";
  role: StaffRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const rail = mode === "rail";
  const labelClass = rail ? "hidden lg:inline" : "inline";
  const groupLabelClass = rail ? "hidden lg:block" : "block";

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/admin/dashboard"
        onClick={onNavigate}
        className="flex h-16 shrink-0 items-center gap-3 border-b border-warm-line px-4 transition-colors duration-150 hover:bg-warm-line/30"
      >
        <Seal size="sm" />
        <span
          className={`font-display text-ui-lg tracking-wide text-ink ${labelClass}`}
        >
          Posh Salon
        </span>
        {rail && <span className="sr-only lg:hidden">Posh Salon — dashboard</span>}
      </Link>

      <nav className="flex-1 overflow-y-auto py-4" aria-label="Admin sections">
        {adminNav.map((group, groupIndex) => {
          const items = group.items.filter((item) => canSeeNav(role, item.role));
          if (items.length === 0) return null;
          return (
            <div
              key={group.group}
              className={
                // Collapsed to icons the group labels vanish, so a hairline keeps
                // Operations and Management from reading as one long list.
                groupIndex > 0
                  ? `mb-4 ${rail ? "mt-4 border-t border-warm-line pt-4 lg:mt-0 lg:border-0 lg:pt-0" : "mb-4"}`
                  : "mb-4"
              }
            >
              <p
                className={`px-4 pb-2 text-meta uppercase text-ink-muted ${groupLabelClass}`}
              >
                {group.group}
              </p>
              <ul>
                {items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={rail ? item.label : undefined}
                        className={`flex items-center gap-3 border-l-2 px-4 py-2.5 text-ui transition-colors duration-150 ${
                          active
                            ? "border-gold bg-warm-line/40 font-medium text-ink"
                            : "border-transparent text-ink-muted hover:bg-warm-line/30 hover:text-ink"
                        }`}
                      >
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 ${
                            active ? "text-gold-shadow" : "text-ink-muted"
                          }`}
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <span className={labelClass}>{item.label}</span>
                        {rail && <span className="sr-only lg:hidden">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

/** Persistent desktop rail: icon-only from `md`, full labels from `lg`. */
export function DesktopSidebar({ role }: { role: StaffRole }) {
  return (
    <aside className="hidden shrink-0 border-r border-warm-line bg-warm-panel md:block md:w-16 lg:w-64 print:hidden">
      <div className="sticky top-0 h-svh">
        <SidebarContent mode="rail" role={role} />
      </div>
    </aside>
  );
}
