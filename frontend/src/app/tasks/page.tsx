"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { RuleHint } from "@/components/rule-hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { TaskCard } from "@/components/ui/task-card";
import { COPY } from "@/lib/copy";
import { useTaskStore } from "@/stores/task-store";
import { useFocusStore } from "@/stores/focus-store";

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const PERIOD_LABELS: Record<string, string> = {
  day: "Today",
  week: "Week",
  month: "Month",
  all: "Everything",
};

export default function TasksPage() {
  const {
    tasks,
    fetchTasks,
    createTask,
    updateTask,
    startTask,
    search,
    filter,
    period,
    page,
    total,
    totalPages,
    setSearch,
    setFilter,
    setPeriod,
    setPage,
    isLoading,
    error,
    clearError,
  } = useTaskStore((state) => state);
  const startSession = useFocusStore((state) => state.startSession);
  const currentSession = useFocusStore((state) => state.currentSession);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks, search, filter, period, page]);

  return (
    <AppShell>
      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12">
          <Panel title={COPY.tasks.panelTitle} subtitle={COPY.tasks.panelSubtitle}>
            <form
              className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end"
              onSubmit={async (event) => {
                event.preventDefault();
                clearError();
                const form = event.currentTarget;
                const formData = new FormData(form);
                try {
                  await createTask({
                    title: String(formData.get("title") ?? ""),
                    estimatedMinutes: Number(formData.get("estimatedMinutes") ?? 25),
                    priority: "medium",
                    dueDate: String(formData.get("dueDate") ?? "") || undefined,
                  });
                  form.reset();
                } catch {
                  // Store-level error message is shown in the panel.
                }
              }}
            >
              <Input className="lg:col-span-5" name="title" placeholder="What do you want to do?" required />
              <Input
                className="lg:col-span-2"
                name="estimatedMinutes"
                type="number"
                min={1}
                defaultValue={30}
              />
              <Input className="lg:col-span-3" name="dueDate" type="date" />
              <Button type="submit" className="lg:col-span-2">
                {COPY.tasks.createButton}
              </Button>
            </form>
            <p className="mt-3 text-xs text-slate-500">{COPY.tasks.duplicateHint}</p>

            <div className="mt-6 space-y-4 border-t border-white/5 pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Find & filter</p>
              <Input
                placeholder={COPY.tasks.searchPlaceholder}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {(["all", "todo", "in_progress", "done"] as const).map((item) => (
                  <Button key={item} variant={filter === item ? "primary" : "outline"} onClick={() => setFilter(item)}>
                    {STATUS_LABELS[item]}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-slate-500">Date range:</span>
                <Button variant={period === "day" ? "primary" : "outline"} onClick={() => setPeriod("day")}>
                  {PERIOD_LABELS.day}
                </Button>
                <details className="group rounded-xl border border-violet-400/20 bg-white/[0.06] px-3 py-2 text-sm shadow-inner backdrop-blur-sm">
                  <summary className="cursor-pointer list-none font-medium text-slate-300 [&::-webkit-details-marker]:hidden">
                    More ranges…
                  </summary>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                    {(["week", "month", "all"] as const).map((item) => (
                      <Button key={item} variant={period === item ? "primary" : "outline"} onClick={() => setPeriod(item)}>
                        {PERIOD_LABELS[item]}
                      </Button>
                    ))}
                  </div>
                </details>
              </div>
              <p className="text-xs text-slate-500">{COPY.tasks.filtersHint}</p>
            </div>

            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
          </Panel>
        </section>

        <section className="col-span-12 space-y-4">
          <RuleHint title="How focus time is recorded" bullets={[COPY.tasks.focusRecordingHint]} />

          {isLoading ? (
            <Panel title="Loading" subtitle="Fetching tasks…">
              <div className="text-slate-500">One moment.</div>
            </Panel>
          ) : null}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              disabled={!!currentSession}
              onStart={async () => {
                startTask(task.id);
                await startSession(task.id);
              }}
              onDone={() => void updateTask(task.id, { status: "done" })}
            />
          ))}
          {!isLoading && tasks.length === 0 ? (
            <Panel title="Nothing here yet" subtitle="Try another range or add a task above">
              <p className="text-sm text-slate-400">
                If you expected older tasks, open “More ranges…” and choose Everything.
              </p>
            </Panel>
          ) : null}
          <div className="flex flex-col gap-2 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {tasks.length} of {total} · Page {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
