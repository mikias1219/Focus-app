import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
});

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
});

let isRefreshing = false;
let pendingResolvers: Array<(token: string | null) => void> = [];

const resolvePending = (token: string | null) => {
  pendingResolvers.forEach((resolve) => resolve(token));
  pendingResolvers = [];
};

function isPublicAuthPath(url: string | undefined) {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes("auth/login") || u.includes("auth/register") || u.includes("auth/refresh")
  );
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && !isPublicAuthPath(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as {
      _retry?: boolean;
      headers?: Record<string, string>;
      url?: string;
    };
    const status = error.response?.status;

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    // Wrong password, stale session cleanup, etc. — never chain refresh on these.
    if (isPublicAuthPath(originalRequest?.url)) {
      return Promise.reject(error);
    }

    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) {
      useAuthStore.setState({ user: null, token: null, refreshToken: null });
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingResolvers.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await refreshClient.post(
        "/auth/refresh",
        {},
        { headers: { "x-refresh-token": refreshToken } },
      );
      useAuthStore.setState({
        token: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user ?? useAuthStore.getState().user,
      });
      resolvePending(data.accessToken);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolvePending(null);
      useAuthStore.setState({ user: null, token: null, refreshToken: null });
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
