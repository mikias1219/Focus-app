"use client";
import { create } from "zustand";

export type AppNotification = {
  id: string;
  type:
    | "task_created"
    | "task_updated"
    | "task_deleted"
    | "focus_started"
    | "focus_stopped"
    | "distraction_logged"
    | "profile_updated";
  title: string;
  message: string;
  createdAt: string;
};

type NotificationState = {
  items: AppNotification[];
  unread: number;
  push: (notification: AppNotification) => void;
  markAllRead: () => void;
  clear: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unread: 0,
  push: (notification) =>
    set((state) => ({
      items: [notification, ...state.items].slice(0, 50),
      unread: state.unread + 1,
    })),
  markAllRead: () => set({ unread: 0 }),
  clear: () => set({ items: [], unread: 0 }),
}));
