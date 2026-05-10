"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock3, History, LayoutDashboard, Settings, CheckSquare } from "lucide-react";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

const items = [
  { href: "/", label: COPY.nav.home, icon: LayoutDashboard },
  { href: "/tasks", label: COPY.nav.tasks, icon: CheckSquare },
  { href: "/focus", label: COPY.nav.focus, icon: Clock3 },
  { href: "/analytics", label: COPY.nav.analytics, icon: BarChart3 },
  { href: "/history", label: COPY.nav.history, icon: History },
  { href: "/settings", label: COPY.nav.settings, icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 border-r border-violet-400/20 bg-gradient-to-b from-violet-950/95 via-slate-950/92 to-teal-950/88 px-3 py-4 shadow-xl shadow-violet-950/40 backdrop-blur-xl transition-all duration-300 ease-out",
        sidebarCollapsed ? "w-[84px]" : "w-[260px]",
        mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
    >
      <div className="mb-6 px-2">
        <p className="bg-gradient-to-r from-teal-300 to-violet-300 bg-clip-text text-xs font-semibold uppercase tracking-widest text-transparent">
          FocusFlow
        </p>
        {!sidebarCollapsed ? (
          <p className="mt-1 text-sm text-slate-400">{COPY.brandTagline}</p>
        ) : null}
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
                active
                  ? "bg-gradient-to-r from-teal-500/25 to-violet-600/25 font-medium text-teal-100 shadow-inner shadow-teal-900/20 ring-1 ring-teal-400/30"
                  : "text-slate-400 hover:bg-white/10 hover:text-slate-100",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-teal-300" : "")} />
              {!sidebarCollapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
