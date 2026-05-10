"use client";
import { create } from "zustand";
import axios from "axios";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  estimatedMinutes: number;
  dueDate?: string;
};

export type TaskFilter = "all" | "todo" | "in_progress" | "done";
export type TaskPeriod = "all" | "day" | "week" | "month";

type TaskState = {
  tasks: Task[];
  /** Larger slice for Today dashboard — avoids pagination hiding due-today items. */
  overviewTasks: Task[];
  activeTask: Task | null;
  search: string;
  filter: TaskFilter;
  period: TaskPeriod;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isOverviewLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  fetchOverviewTasks: () => Promise<void>;
  createTask: (task: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    estimatedMinutes: number;
    dueDate?: string;
  }) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  startTask: (taskId: string) => void;
  clearActiveTask: () => void;
  setSearch: (search: string) => void;
  setFilter: (filter: TaskFilter) => void;
  setPeriod: (period: TaskPeriod) => void;
  setPage: (page: number) => void;
  clearError: () => void;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  overviewTasks: [],
  activeTask: null,
  search: "",
  filter: "all",
  period: "day",
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 1,
  isLoading: false,
  isOverviewLoading: false,
  error: null,
  fetchOverviewTasks: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ overviewTasks: [] });
      return;
    }
    set({ isOverviewLoading: true });
    try {
      const params = new URLSearchParams();
      params.set("period", "all");
      params.set("page", "1");
      params.set("pageSize", "50");
      const { data } = await api.get(`/tasks?${params.toString()}`);
      set({
        overviewTasks: data.items ?? [],
        isOverviewLoading: false,
      });
    } catch {
      set({ overviewTasks: [], isOverviewLoading: false });
    }
  },
  fetchTasks: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ tasks: [], error: "Please login to load tasks." });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const { search, filter, period, page, pageSize } = get();
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter !== "all") params.set("status", filter);
      if (period !== "all") params.set("period", period);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      const { data } = await api.get(`/tasks?${params.toString()}`);
      set({
        tasks: data.items ?? [],
        total: data.total ?? 0,
        totalPages: data.totalPages ?? 1,
        isLoading: false,
      });
    } catch {
      set({ error: "Could not load tasks.", isLoading: false });
    }
  },
  createTask: async (task) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: "Not authenticated. Please login again." });
      throw new Error("Not authenticated. Please login again.");
    }
    set({ error: null });
    try {
      await api.post("/tasks", task);
      await get().fetchTasks();
      await get().fetchOverviewTasks();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage =
          (error.response?.data as { message?: string | string[] } | undefined)?.message;
        const message = Array.isArray(backendMessage)
          ? backendMessage.join(", ")
          : backendMessage;
        set({ error: message ?? "Task creation failed. Please check inputs." });
      } else {
        set({ error: "Task creation failed. Please check inputs." });
      }
      throw error;
    }
  },
  updateTask: async (taskId, updates) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ error: null });
    try {
      await api.patch(`/tasks/${taskId}`, updates);
      await get().fetchTasks();
      await get().fetchOverviewTasks();
    } catch {
      set({ error: "Task update failed." });
    }
  },
  deleteTask: async (taskId) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ error: null });
    try {
      await api.delete(`/tasks/${taskId}`);
      const activeTask = get().activeTask;
      if (activeTask?.id === taskId) {
        set({ activeTask: null });
      }
      await get().fetchTasks();
      await get().fetchOverviewTasks();
    } catch {
      set({ error: "Task deletion failed." });
    }
  },
  startTask: (taskId) => {
    const task = get().tasks.find((item) => item.id === taskId) ?? null;
    set({ activeTask: task });
  },
  clearActiveTask: () => set({ activeTask: null }),
  setSearch: (search) => set({ search, page: 1 }),
  setFilter: (filter) => set({ filter, page: 1 }),
  setPeriod: (period) => set({ period, page: 1 }),
  setPage: (page) => set({ page }),
  clearError: () => set({ error: null }),
}));
