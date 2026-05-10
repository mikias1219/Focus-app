"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  dailyFocusGoalMinutes: number;
  enableRealtimeNotifications: boolean;
  compactMobileCards: boolean;
  setDailyFocusGoalMinutes: (value: number) => void;
  setEnableRealtimeNotifications: (value: boolean) => void;
  setCompactMobileCards: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      dailyFocusGoalMinutes: 180,
      enableRealtimeNotifications: true,
      compactMobileCards: false,
      setDailyFocusGoalMinutes: (value) =>
        set({ dailyFocusGoalMinutes: Math.max(30, Math.min(value, 720)) }),
      setEnableRealtimeNotifications: (value) =>
        set({ enableRealtimeNotifications: value }),
      setCompactMobileCards: (value) => set({ compactMobileCards: value }),
    }),
    { name: "focusflow-settings" },
  ),
);
