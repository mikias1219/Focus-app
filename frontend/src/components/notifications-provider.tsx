"use client";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth-store";
import { AppNotification, useNotificationStore } from "@/stores/notification-store";
import { useSettingsStore } from "@/stores/settings-store";

let socketRef: Socket | null = null;

export function NotificationsProvider() {
  const token = useAuthStore((state) => state.token);
  const push = useNotificationStore((state) => state.push);
  const enabled = useSettingsStore((state) => state.enableRealtimeNotifications);

  useEffect(() => {
    if (!token || !enabled) {
      if (socketRef) {
        socketRef.disconnect();
        socketRef = null;
      }
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
    const socketBase = apiUrl.replace(/\/api$/, "");
    socketRef = io(`${socketBase}/notifications`, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.on("notification", (notification: AppNotification) => {
      push(notification);
    });
    return () => {
      if (socketRef) {
        socketRef.disconnect();
        socketRef = null;
      }
    };
  }, [enabled, token, push]);

  return null;
}
