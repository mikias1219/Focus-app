"use client";
import { create } from "zustand";

type UiState = {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  notificationsOpen: boolean;
  toggleSidebarCollapsed: () => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  setNotificationsOpen: (open: boolean) => void;
  toggleNotificationsOpen: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  mobileNavOpen: false,
  notificationsOpen: false,
  toggleSidebarCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  toggleNotificationsOpen: () =>
    set((state) => ({ notificationsOpen: !state.notificationsOpen })),
}));
