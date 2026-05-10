"use client";

import { Bell, ChevronsLeftRight, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { SHELL_PADDING_X } from "@/lib/shell-layout";
import { useNotificationStore } from "@/stores/notification-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function TopNav() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unread = useNotificationStore((s) => s.unread);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 border-teal-400/15 bg-slate-950/35 backdrop-blur-xl">
      <div className={cn("flex h-16 w-full items-center justify-between gap-3", SHELL_PADDING_X)}>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button variant="ghost" className="shrink-0 md:hidden" onClick={toggleMobileNav}>
            <Menu className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="hidden shrink-0 md:inline-flex" onClick={toggleSidebarCollapsed}>
            <ChevronsLeftRight className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-teal-300/80">Signed in</p>
            <p className="truncate text-sm text-slate-100">{user?.email}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" onClick={markAllRead}>
            <Bell className="h-4 w-4 text-amber-200/90" />
            {unread > 0 ? (
              <Badge variant="danger" className="ml-2">
                {unread}
              </Badge>
            ) : null}
          </Button>
          <Button
            variant="outline"
            className="border-violet-400/25 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
