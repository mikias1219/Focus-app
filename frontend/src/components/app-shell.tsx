"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { SHELL_PADDING_X } from "@/lib/shell-layout";
import { useNotificationStore } from "@/stores/notification-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const notifications = useNotificationStore((state) => state.items);
  const [hydrated, setHydrated] = useState(false);
  const validatedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const persistApi = useAuthStore.persist;
    setHydrated(persistApi.hasHydrated());
    const unsub = persistApi.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/login");
      validatedTokenRef.current = null;
      return;
    }
    // One profile fetch per access token — avoids refiring when `user` object identity updates.
    if (validatedTokenRef.current === token) return;
    validatedTokenRef.current = token;
    void useAuthStore.getState().fetchMe();
  }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-teal-400/80 border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent px-4 text-sm text-slate-400">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen min-w-0 flex-col transition-[padding] duration-300 ease-out",
          sidebarCollapsed ? "md:pl-[84px]" : "md:pl-[260px]",
        )}
      >
        <TopNav />
        <main className={cn("min-w-0 flex-1 py-6", SHELL_PADDING_X)}>
          <div className="w-full space-y-5">
            {notifications.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-3">
                {notifications.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-teal-400/20 bg-white/[0.07] p-3 text-sm shadow-lg shadow-violet-950/20 backdrop-blur-md"
                  >
                    <p className="font-medium text-slate-100">{item.title}</p>
                    <p className="text-slate-400">{item.message}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
