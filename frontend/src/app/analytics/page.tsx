"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { RuleHint } from "@/components/rule-hint";
import { Badge } from "@/components/ui/badge";
import { AnalyticsCard } from "@/components/ui/analytics-card";
import { Panel } from "@/components/ui/panel";
import { COPY } from "@/lib/copy";
import { useAnalyticsStore } from "@/stores/analytics-store";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatRatio(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

export default function AnalyticsPage() {
  const loadStats = useAnalyticsStore((state) => state.loadStats);
  const stats = useAnalyticsStore((state) => state.stats);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const data = [
    { name: "Completed", value: stats?.completedTasks ?? 0 },
    { name: "Focus (m)", value: stats?.totalFocusMinutes ?? 0 },
    { name: "Distractions", value: stats?.distractionCount ?? 0 },
    { name: "Score", value: stats?.productivityScore ?? 0 },
  ];

  return (
    <AppShell>
      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12">
          <Panel title="Numbers" subtitle={COPY.analytics.subtitle}>
            <RuleHint title="How today’s score works" bullets={COPY.dashboard.scoringRules} className="mb-6" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-100">Today</h2>
              <Badge variant={Number(stats?.productivityScore ?? 0) >= 60 ? "success" : "warning"}>
                Score {stats?.productivityScore ?? 0}
              </Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <AnalyticsCard title="Tasks finished" value={stats?.completedTasks ?? 0} tone="success" />
              <AnalyticsCard title="Focus minutes" value={`${stats?.totalFocusMinutes ?? 0}`} tone="info" />
              <AnalyticsCard title="Distractions" value={stats?.distractionCount ?? 0} tone="danger" />
              <AnalyticsCard title="Accuracy bonus" value={stats?.efficiencyBonus ?? 0} tone="warning" />
              <AnalyticsCard
                title="Accuracy ratio"
                value={formatRatio(stats?.efficiencyRatio)}
                tone="warning"
                hint={COPY.analytics.ratioHint}
              />
            </div>
          </Panel>
        </section>
        <section className="col-span-12">
          <Panel title="Simple chart" subtitle="Same numbers, easier to scan than tables">
            <div className="h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(30, 27, 75, 0.95)",
                      border: "1px solid rgba(94, 234, 212, 0.25)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {data.map((item) => (
                      <Cell
                        key={item.name}
                        fill={
                          item.name === "Score"
                            ? "#14b8a6"
                            : item.name === "Distractions"
                              ? "#fb7185"
                              : "#64748b"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}
