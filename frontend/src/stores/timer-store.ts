"use client";
import { create } from "zustand";

type TimerState = {
  isRunning: boolean;
  isPaused: boolean;
  seconds: number;
  activeTaskId: string | null;
  intervalId: ReturnType<typeof setInterval> | null;
  startTimer: (taskId: string, initialSeconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
};

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  seconds: 0,
  activeTaskId: null,
  intervalId: null,
  startTimer: (taskId, initialSeconds = 0) => {
    const current = get().intervalId;
    if (current) clearInterval(current);
    const intervalId = setInterval(() => {
      set((state) => ({ seconds: state.seconds + 1 }));
    }, 1000);
    set({
      isRunning: true,
      isPaused: false,
      seconds: initialSeconds,
      activeTaskId: taskId,
      intervalId,
    });
  },
  pauseTimer: () => {
    const intervalId = get().intervalId;
    if (intervalId) clearInterval(intervalId);
    set({ isRunning: false, isPaused: true, intervalId: null });
  },
  resumeTimer: () => {
    const taskId = get().activeTaskId;
    if (!taskId) return;
    const intervalId = setInterval(() => {
      set((state) => ({ seconds: state.seconds + 1 }));
    }, 1000);
    set({ isRunning: true, isPaused: false, intervalId });
  },
  stopTimer: () => {
    const intervalId = get().intervalId;
    if (intervalId) clearInterval(intervalId);
    set({ isRunning: false, isPaused: false, activeTaskId: null, intervalId: null });
  },
}));
