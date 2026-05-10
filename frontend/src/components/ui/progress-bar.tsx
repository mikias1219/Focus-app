import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-xl bg-white/10 shadow-inner", className)}>
      <div
        className="h-full rounded-xl bg-gradient-to-r from-violet-500 via-teal-400 to-amber-400 transition-all duration-500 ease-out shadow-sm shadow-teal-500/30"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
