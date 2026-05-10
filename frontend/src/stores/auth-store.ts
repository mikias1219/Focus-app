"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getApiErrorMessage } from "@/lib/api-error";
import { api } from "@/lib/api";

type User = { id: string; email: string };
type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  updateProfile: (payload: { email?: string; password?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      login: async (email, password) => {
        try {
          const { data } = await api.post("/auth/login", {
            email: email.trim(),
            password,
          });
          set({ user: data.user, token: data.accessToken, refreshToken: data.refreshToken });
        } catch (err) {
          throw new Error(getApiErrorMessage(err, "Login failed."));
        }
      },
      register: async (email, password) => {
        try {
          const { data } = await api.post("/auth/register", {
            email: email.trim(),
            password,
          });
          set({ user: data.user, token: data.accessToken, refreshToken: data.refreshToken });
        } catch (err) {
          throw new Error(getApiErrorMessage(err, "Registration failed."));
        }
      },
      fetchMe: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const { data } = await api.get("/users/me");
          set({ user: { id: data.id, email: data.email } });
        } catch {
          // Expired refresh / cleared session — interceptor may already have wiped tokens.
          set({
            user: null,
            token: null,
            refreshToken: null,
          });
        }
      },
      updateProfile: async (payload) => {
        const token = get().token;
        if (!token) return;
        try {
          const { data } = await api.patch("/users/me", payload);
          set((state) => ({
            ...state,
            user: { id: data.id, email: data.email },
          }));
        } catch (err) {
          throw new Error(getApiErrorMessage(err, "Could not update profile."));
        }
      },
      logout: async () => {
        try {
          const token = get().token;
          if (token) await api.post("/auth/logout");
        } catch {
          // Still clear local session if token invalid or network fails.
        } finally {
          set({ user: null, token: null, refreshToken: null });
        }
      },
    }),
    { name: "focusflow-auth" },
  ),
);
