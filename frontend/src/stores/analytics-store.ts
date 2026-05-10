"use client";
import { create } from "zustand";
import { api } from "@/lib/api";

type AnalyticsStats = {
  completedTasks: number;
  totalFocusMinutes: number;
  distractionCount: number;
  efficiencyBonus: number;
  efficiencyRatio: number;
  productivityScore: number;
};

type AnalyticsState = {
  stats: AnalyticsStats | null;
  productivityScore: number;
  loadStats: () => Promise<void>;
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  stats: null,
  productivityScore: 0,
  loadStats: async () => {
    const { data } = await api.get("/analytics/dashboard");
    set({ stats: data, productivityScore: data.productivityScore });
  },
}));
