import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CalendarDays,
  Receipt,
  History,
  Package,
  Scissors,
  UserCog,
  BarChart3,
  Globe,
  Settings,
} from "lucide-react";

// RBAC visibility: `role` is the minimum staff role that sees the item in the
// rail. The page itself re-checks via requireRole() — the nav is a courtesy,
// never the gate.
export type AdminRole = "all" | "manager" | "admin";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  role: AdminRole;
};

export type AdminNavGroup = {
  group: string;
  items: AdminNavItem[];
};

export const adminNav: AdminNavGroup[] = [
  {
    group: "Operations",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        role: "all",
      },
      {
        label: "Customers",
        href: "/admin/customers",
        icon: Users,
        role: "all",
      },
      {
        label: "Memberships",
        href: "/admin/memberships",
        icon: Wallet,
        role: "all",
      },
      {
        label: "Appointments",
        href: "/admin/appointments",
        icon: CalendarDays,
        role: "all",
      },
      {
        label: "Billing",
        href: "/admin/billing",
        icon: Receipt,
        role: "all",
      },
      {
        label: "Billing History",
        href: "/admin/billing-history",
        icon: History,
        role: "all",
      },
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
        role: "all",
      },
      {
        label: "Services",
        href: "/admin/services",
        icon: Scissors,
        role: "all",
      },
    ],
  },
  {
    group: "Management",
    items: [
      {
        label: "Employees",
        href: "/admin/employees",
        icon: UserCog,
        role: "manager",
      },
      {
        label: "Reports",
        href: "/admin/reports",
        icon: BarChart3,
        role: "manager",
      },
      {
        label: "Website",
        href: "/admin/website",
        icon: Globe,
        role: "manager",
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        role: "admin",
      },
    ],
  },
];
