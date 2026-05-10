"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { TimerDisplay } from "@/components/ui/timer-display";
import { COPY } from "@/lib/copy";
import { api } from "@/lib/api";
import { useFocusStore } from "@/stores/focus-store";
import { useTimerStore } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";

export default function FocusModePage() {
  const currentSession = useFocusStore((state) => state.currentSession);
  const hydrateActiveSession = useFocusStore((state) => state.hydrateActiveSession);
  const stopSession = useFocusStore((state) => state.stopSession);
  const seconds = useTimerStore((state) => state.seconds);
  const tasks = useTaskStore((state) => state.tasks);
  const overviewTasks = useTaskStore((state) => state.overviewTasks);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const fetchOverviewTasks = useTaskStore((state) => state.fetchOverviewTasks);

  const activeTask =
    overviewTasks.find((task) => task.id === currentSession?.taskId) ??
    tasks.find((task) => task.id === currentSession?.taskId);

  useEffect(() => {
    void hydrateActiveSession();
    void fetchOverviewTasks();
    void fetchTasks();
  }, [hydrateActiveSession, fetchOverviewTasks, fetchTasks]);

  return (
    <AppShell>
      <Panel
        title="Focus"
        subtitle={COPY.focus.subtitle}
        className="min-h-[70vh] border-violet-400/15 bg-gradient-to-b from-violet-950/40 via-slate-950/30 to-teal-950/35"
      >
        <div className="flex h-full flex-col items-center justify-center gap-6 py-4">
          <Badge variant={currentSession ? "success" : "warning"}>
            {currentSession ? "Session running" : "No active session"}
          </Badge>
          <TimerDisplay
            seconds={seconds}
            estimatedMinutes={activeTask?.estimatedMinutes ?? 25}
            running={!!currentSession}
          />
          <p className="max-w-md text-center text-sm text-slate-300">
            {currentSession
              ? `Now: ${activeTask?.title ?? "your task"}`
              : "Start from Today or My tasks — this screen stays minimal on purpose."}
          </p>
          <div className="flex max-w-lg flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              disabled={!currentSession}
              onClick={async () => {
                if (!currentSession) return;
                await api.post("/distractions", { sessionId: currentSession.id, type: "manual_break" });
              }}
            >
              Quick break
            </Button>
            <Button
              variant="secondary"
              disabled={!currentSession}
              onClick={async () => {
                if (!currentSession) return;
                await api.post("/distractions", { sessionId: currentSession.id, type: "social_media" });
              }}
            >
              Social pull
            </Button>
            <Button
              variant="secondary"
              disabled={!currentSession}
              onClick={async () => {
                if (!currentSession) return;
                await api.post("/distractions", { sessionId: currentSession.id, type: "unknown" });
              }}
            >
              Other distraction
            </Button>
            <Button variant="danger" disabled={!currentSession} onClick={stopSession}>
              Stop & save
            </Button>
          </div>
        </div>
      </Panel>
    </AppShell>
  );
}
