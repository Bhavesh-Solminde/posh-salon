"use client";

import { useCallback, useState, type ReactNode } from "react";
import { DesktopSidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileDrawer } from "./MobileDrawer";
import { ToastProvider } from "./ui/Toast";
import type { SessionUser } from "@/lib/roles";

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <ToastProvider>
      <div className="flex min-h-svh bg-warm-white text-ink print:block print:bg-white">
        <a
          href="#admin-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:border focus:border-gold focus:bg-warm-white focus:px-4 focus:py-2 focus:text-ui-sm"
        >
          Skip to content
        </a>

        <DesktopSidebar role={user.role} />
        <MobileDrawer open={drawerOpen} onClose={closeDrawer} role={user.role} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} onOpenDrawer={openDrawer} />
          <main id="admin-content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
