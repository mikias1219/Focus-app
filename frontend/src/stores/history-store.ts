"use client";
import { create } from "zustand";
import { api } from "@/lib/api";

type HistoryTask = { id: string; title: string; status: string; estimatedMinutes: number };
type HistorySession = { id: string; status: string; duration: number; startTime: string };
type HistoryDistraction = { id: string; type: string; timestamp: string };

type HistoryState = {
  tasks: HistoryTask[];
  sessions: HistorySession[];
  distractions: HistoryDistraction[];
  search: string;
  status: "all" | "todo" | "in_progress" | "done";
  period: "all" | "day" | "week" | "month";
  page: number;
  pageSize: number;
  totals: { tasks: number; sessions: number; distractions: number };
  totalPages: { tasks: number; sessions: number; distractions: number };
  isLoading: boolean;
  fetchHistory: () => Promise<void>;
  setSearch: (search: string) => void;
  setStatus: (status: "all" | "todo" | "in_progress" | "done") => void;
  setPeriod: (period: "all" | "day" | "week" | "month") => void;
  setPage: (page: number) => void;
};

function dateRangeForPeriod(period: "all" | "day" | "week" | "month") {
  if (period === "all") return {};
  const now = new Date();
  const start = new Date(now);
  if (period === "day") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = start.getDay();
    const diffToMonday = (day + 6) % 7;
    start.setDate(start.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }
  return {
    startDate: start.toISOString(),
    endDate: now.toISOString(),
  };
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  tasks: [],
  sessions: [],
  distractions: [],
  search: "",
  status: "all",
  period: "all",
  page: 1,
  pageSize: 10,
  totals: { tasks: 0, sessions: 0, distractions: 0 },
  totalPages: { tasks: 1, sessions: 1, distractions: 1 },
  isLoading: false,
  fetchHistory: async () => {
    set({ isLoading: true });
    const { search, status, period, page, pageSize } = get();
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    const range = dateRangeForPeriod(period);
    if (range.startDate) params.set("startDate", range.startDate);
    if (range.endDate) params.set("endDate", range.endDate);
    const { data } = await api.get(`/history?${params.toString()}`);
    set({
      tasks: data.tasks ?? [],
      sessions: data.sessions ?? [],
      distractions: data.distractions ?? [],
      totals: data.totals ?? { tasks: 0, sessions: 0, distractions: 0 },
      totalPages: data.totalPages ?? { tasks: 1, sessions: 1, distractions: 1 },
      isLoading: false,
    });
  },
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPeriod: (period) => set({ period, page: 1 }),
  setPage: (page) => set({ page }),
}));
