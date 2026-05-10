"use client";
import { create } from "zustand";
import { api } from "@/lib/api";
import { useTimerStore } from "./timer-store";

type Session = {
  id: string;
  taskId: string;
  startTime: string;
  status: "active" | "completed";
};

type FocusState = {
  currentSession: Session | null;
  isLoading: boolean;
  startSession: (taskId: string) => Promise<void>;
  stopSession: () => Promise<void>;
  hydrateActiveSession: () => Promise<void>;
};

export const useFocusStore = create<FocusState>((set, get) => ({
  currentSession: null,
  isLoading: false,
  hydrateActiveSession: async () => {
    try {
      const { data } = await api.get("/focus-sessions/active");
      if (!data) {
        set({ currentSession: null });
        useTimerStore.getState().stopTimer();
        return;
      }
      const elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000),
      );
      set({ currentSession: data });
      useTimerStore.getState().startTimer(data.taskId, elapsedSeconds);
    } catch {
      set({ currentSession: null });
    }
  },
  startSession: async (taskId) => {
    set({ isLoading: true });
    const { data } = await api.post("/focus-sessions/start", { taskId });
    set({ currentSession: data, isLoading: false });
    useTimerStore.getState().startTimer(taskId, 0);
  },
  stopSession: async () => {
    const session = get().currentSession;
    if (!session) return;
    await api.post(`/focus-sessions/${session.id}/stop`);
    useTimerStore.getState().stopTimer();
    set({ currentSession: null, isLoading: false });
  },
}));
