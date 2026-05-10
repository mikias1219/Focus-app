"use client";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { COPY } from "@/lib/copy";
import { useHistoryStore } from "@/stores/history-store";

export default function HistoryPage() {
  const {
    tasks,
    sessions,
    distractions,
    search,
    status,
    period,
    page,
    totals,
    totalPages,
    isLoading,
    fetchHistory,
    setSearch,
    setStatus,
    setPeriod,
    setPage,
  } = useHistoryStore((state) => state);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory, search, status, period, page]);

  return (
    <AppShell>
      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-12">
          <Panel title="Past sessions" subtitle={COPY.history.subtitle}>
          <p className="text-sm text-slate-400">
            Tasks you finished, focus blocks you ran, and distractions you logged — newest first when you scroll.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Input
              placeholder="Search history..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {(["all", "todo", "in_progress", "done"] as const).map((item) => (
                <Button
                  key={item}
                  variant={status === item ? "default" : "outline"}
                  onClick={() => setStatus(item)}
                >
                  {item.replace("_", " ")}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "day", "week", "month"] as const).map((item) => (
                <Button
                  key={item}
                  variant={period === item ? "default" : "outline"}
                  onClick={() => setPeriod(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            <div className="text-sm text-slate-400 md:text-right">
              Tasks: {totals.tasks} · Sessions: {totals.sessions} · Distractions: {totals.distractions}
            </div>
          </div>
          </Panel>
        </section>

        <section className="col-span-12 xl:col-span-4">
          <Panel title="Focus Sessions" subtitle="Card-based logs (no tables)">
          <div className="space-y-2 text-sm">
            {sessions.map(
              (session: { id: string; status: string; duration: number; startTime: string }) => (
                <div key={session.id} className="rounded-2xl border border-white/15 bg-white/[0.06] p-3 backdrop-blur-sm">
                  <div>
                    <p className="font-medium text-slate-200">{new Date(session.startTime).toLocaleString()}</p>
                    <p className="text-slate-400">{Math.floor((session.duration ?? 0) / 60)} minutes focused</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant={session.status === "completed" ? "success" : "info"}>{session.status}</Badge>
                    <p className="text-xs text-slate-500">Efficiency card view</p>
                  </div>
                </div>
              ),
            )}
            {sessions.length === 0 ? (
              <p className="text-slate-500">No focus sessions recorded yet.</p>
            ) : null}
          </div>
          </Panel>
        </section>

        <section className="col-span-12 xl:col-span-4">
          <Panel title="Distractions" subtitle="Interruption events">
          <div className="space-y-2 text-sm">
            {distractions.map((item: { id: string; type: string; timestamp: string }) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.06] p-3 backdrop-blur-sm">
                <p className="text-slate-300">{new Date(item.timestamp).toLocaleString()}</p>
                <Badge variant="danger">{item.type}</Badge>
              </div>
            ))}
            {distractions.length === 0 ? (
              <p className="text-slate-500">No distractions logged.</p>
            ) : null}
          </div>
          </Panel>
        </section>

        <section className="col-span-12 xl:col-span-4">
          <Panel title="Task Archive" subtitle="Planned vs actual tracking cards">
          <div className="space-y-2 text-sm">
            {tasks.map((task: { id: string; title: string; status: string; estimatedMinutes: number }) => (
              <div key={task.id} className="rounded-2xl border border-white/15 bg-white/[0.06] p-3 backdrop-blur-sm">
                <div>
                  <p className="font-medium text-slate-200">{task.title}</p>
                  <p className="text-slate-400">Planned {task.estimatedMinutes} minutes</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant={task.status === "done" ? "success" : "warning"}>{task.status}</Badge>
                  <p className="text-xs text-slate-500">Expand details soon</p>
                </div>
              </div>
            ))}
            {tasks.length === 0 ? (
              <p className="text-slate-500">No task history yet.</p>
            ) : null}
          </div>
          </Panel>
        </section>
        <section className="col-span-12 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {isLoading ? "Loading..." : `Page ${page} of ${totalPages.tasks}`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages.tasks}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
