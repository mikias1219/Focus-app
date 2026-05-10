import { SURFACE_INSET } from "@/lib/shell-layout";
import { cn } from "@/lib/utils";

export function AnalyticsCard({
  title,
  value,
  tone = "default",
  hint,
}: {
  title: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  hint?: string;
}) {
  const toneDot =
    tone === "success"
      ? "bg-emerald-400"
      : tone === "warning"
        ? "bg-amber-400"
        : tone === "danger"
          ? "bg-rose-400"
          : tone === "info"
            ? "bg-sky-400"
            : "bg-slate-400";

  return (
    <div className={cn(SURFACE_INSET, "border-violet-400/15 p-4")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500">
          <span className={`h-1.5 w-1.5 rounded-full ${toneDot}`} aria-hidden />
          Today
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
