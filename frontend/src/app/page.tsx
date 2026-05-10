"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { RuleHint } from "@/components/rule-hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalyticsCard } from "@/components/ui/analytics-card";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TaskCard } from "@/components/ui/task-card";
import { TimerDisplay } from "@/components/ui/timer-display";
import { COPY } from "@/lib/copy";
import { SURFACE_INSET } from "@/lib/shell-layout";
import { cn } from "@/lib/utils";
import { useAnalyticsStore } from "@/stores/analytics-store";
import { useFocusStore } from "@/stores/focus-store";
import { useTaskStore } from "@/stores/task-store";
import { useTimerStore } from "@/stores/timer-store";
import { useSettingsStore } from "@/stores/settings-store";

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatRatio(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

export default function DashboardPage() {
  const overviewTasks = useTaskStore((state) => state.overviewTasks);
  const activeTask = useTaskStore((state) => state.activeTask);
  const fetchOverviewTasks = useTaskStore((state) => state.fetchOverviewTasks);
  const isOverviewLoading = useTaskStore((state) => state.isOverviewLoading);
  const startTask = useTaskStore((state) => state.startTask);
  const currentSession = useFocusStore((state) => state.currentSession);
  const hydrateActiveSession = useFocusStore((state) => state.hydrateActiveSession);
  const startSession = useFocusStore((state) => state.startSession);
  const stopSession = useFocusStore((state) => state.stopSession);
  const seconds = useTimerStore((state) => state.seconds);
  const isRunning = useTimerStore((state) => state.isRunning);
  const isPaused = useTimerStore((state) => state.isPaused);
  const pauseTimer = useTimerStore((state) => state.pauseTimer);
  const resumeTimer = useTimerStore((state) => state.resumeTimer);
  const loadStats = useAnalyticsStore((state) => state.loadStats);
  const stats = useAnalyticsStore((state) => state.stats);
  const dailyGoal = useSettingsStore((state) => state.dailyFocusGoalMinutes);

  useEffect(() => {
    void fetchOverviewTasks();
    void loadStats();
    void hydrateActiveSession();
  }, [fetchOverviewTasks, loadStats, hydrateActiveSession]);

  const readyTasks = overviewTasks.filter((task) => task.status !== "done");
  const nextTask = readyTasks[0];
  const today = new Date().toDateString();
  const todayTasks = readyTasks.filter((task) => {
    if (!task.dueDate) return true;
    return new Date(task.dueDate).toDateString() === today;
  });
  const todayEstimate = todayTasks.reduce((acc, task) => acc + task.estimatedMinutes, 0);
  const todayDate = new Date();
  const todayWeekdayName = weekdayNames[todayDate.getDay()];
  const weekDays = Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date(todayDate);
    const day = date.getDay();
    const diffToMonday = (day + 6) % 7;
    date.setDate(date.getDate() - diffToMonday + idx);
    return {
      short: weekdayNames[date.getDay()],
      iso: date.toISOString().slice(0, 10),
      isToday: date.toDateString() === todayDate.toDateString(),
    };
  });
  const dailyProgress = Math.min(
    100,
    Math.round(((stats?.totalFocusMinutes ?? 0) / Math.max(dailyGoal, 1)) * 100),
  );

  return (
    <AppShell>
      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 overflow-hidden rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-900/35 via-teal-900/25 to-amber-500/10 p-6 shadow-xl shadow-violet-950/30 backdrop-blur-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl space-y-2">
              <p className="text-sm font-medium text-teal-200/90">{todayWeekdayName}</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
                {COPY.dashboard.heroTitle}
              </h1>
              <p className="text-sm leading-relaxed text-slate-400">{COPY.dashboard.heroSubtitle}</p>
              <div className="pt-2">
                <ProgressBar value={dailyProgress} />
                <p className="mt-2 text-xs text-slate-500">
                  Daily goal: {stats?.totalFocusMinutes ?? 0} / {dailyGoal} min focused
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5 rounded-xl bg-white/10 p-2 shadow-inner shadow-violet-950/40 backdrop-blur-md sm:gap-2">
              {weekDays.map((day) => (
                <div
                  key={day.iso}
                  className={`flex h-12 w-10 flex-col items-center justify-center rounded-lg text-[11px] font-medium sm:h-14 sm:w-11 sm:text-xs ${
                    day.isToday ? "bg-teal-500/90 text-slate-950" : "bg-white/5 text-slate-400"
                  }`}
                >
                  {day.short}
                </div>
              ))}
            </div>
          </div>
          <RuleHint title="How today’s score works" bullets={COPY.dashboard.scoringRules} className="mt-6" />
        </section>

        <section className="col-span-12 lg:col-span-5 xl:col-span-4">
          <Panel title={COPY.dashboard.tasksTitle} subtitle={COPY.dashboard.tasksSubtitle}>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-center" asChild>
                <Link href="/tasks">{COPY.dashboard.quickLinkTasks}</Link>
              </Button>
              {isOverviewLoading ? (
                <p className={cn(SURFACE_INSET, "border-violet-400/15 p-4 text-sm text-slate-500")}>
                  Loading your tasks…
                </p>
              ) : null}
              {!isOverviewLoading &&
                todayTasks.slice(0, 6).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    disabled={!!currentSession}
                    onStart={async () => {
                      startTask(task.id);
                      await startSession(task.id);
                    }}
                    onDone={() => void useTaskStore.getState().updateTask(task.id, { status: "done" })}
                  />
                ))}
              {!isOverviewLoading && todayTasks.length === 0 ? (
                <p className={cn(SURFACE_INSET, "border-violet-400/15 p-4 text-sm text-slate-400")}>
                  {COPY.dashboard.emptyTasks}
                </p>
              ) : null}
            </div>
          </Panel>
        </section>

        <section className="col-span-12 lg:col-span-7 xl:col-span-5">
          <Panel title={COPY.dashboard.cockpitTitle} subtitle={COPY.dashboard.cockpitSubtitle}>
            <TimerDisplay
              seconds={seconds}
              estimatedMinutes={activeTask?.estimatedMinutes ?? nextTask?.estimatedMinutes ?? 25}
              running={isRunning}
            />
            <div className={cn(SURFACE_INSET, "border-teal-400/20 p-4")}>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Working on</p>
              <p className="mt-2 text-lg font-semibold text-slate-100">
                {activeTask?.title ?? nextTask?.title ?? "Pick a task below or on My tasks"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Planned ~{activeTask?.estimatedMinutes ?? nextTask?.estimatedMinutes ?? 0} min
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="primary"
                disabled={!nextTask || !!currentSession}
                onClick={async () => {
                  if (!nextTask) return;
                  startTask(nextTask.id);
                  await startSession(nextTask.id);
                }}
              >
                Start focus
              </Button>
              <Button variant="ghost" disabled={!isRunning} onClick={pauseTimer}>
                Pause timer
              </Button>
              <Button variant="outline" disabled={!isPaused} onClick={resumeTimer}>
                Resume
              </Button>
              <Button variant="danger" disabled={!currentSession} onClick={stopSession}>
                Stop & save
              </Button>
              <Badge variant={isRunning ? "success" : isPaused ? "info" : "warning"}>
                {isRunning ? "Running" : isPaused ? "Paused" : "Idle"}
              </Badge>
            </div>
          </Panel>
        </section>

        <section className="col-span-12 xl:col-span-3">
          <Panel title={COPY.dashboard.statsTitle} subtitle={COPY.dashboard.statsSubtitle}>
            <div className="space-y-3">
              <AnalyticsCard title="Score" value={stats?.productivityScore ?? 0} tone="success" />
              <AnalyticsCard title="Focus today" value={`${stats?.totalFocusMinutes ?? 0} min`} tone="info" />
              <AnalyticsCard
                title="Estimate accuracy"
                value={formatRatio(stats?.efficiencyRatio)}
                tone="warning"
                hint="Near 1.0 usually means plans matched reality."
              />
              <AnalyticsCard title="Distractions logged" value={stats?.distractionCount ?? 0} tone="danger" />
            </div>
          </Panel>
        </section>

        <section className="col-span-12">
          <Panel
            title="Quick summary"
            subtitle={`Goal ${dailyGoal} min · Planned ~${todayEstimate} min for tasks marked today`}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className={cn(SURFACE_INSET, "border-violet-400/12 p-4 text-sm text-slate-400")}>
                Finished tasks today{" "}
                <span className="block text-xl font-semibold text-slate-50">{stats?.completedTasks ?? 0}</span>
              </div>
              <div className={cn(SURFACE_INSET, "border-violet-400/12 p-4 text-sm text-slate-400")}>
                Accuracy bonus{" "}
                <span className="block text-xl font-semibold text-slate-50">{stats?.efficiencyBonus ?? 0}</span>
              </div>
              <div className={cn(SURFACE_INSET, "border-violet-400/12 p-4 text-sm text-slate-400")}>
                Accuracy ratio{" "}
                <span className="block text-xl font-semibold text-slate-50">
                  {formatRatio(stats?.efficiencyRatio)}
                </span>
              </div>
              <div className={cn(SURFACE_INSET, "border-violet-400/12 p-4 text-sm text-slate-400")}>
                Tasks queued for today{" "}
                <span className="block text-xl font-semibold text-slate-50">{todayTasks.length}</span>
              </div>
            </div>
            <RuleHint
              title={COPY.future.reminders}
              bullets={[COPY.future.aiInsights]}
              className="mt-4"
            />
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}
