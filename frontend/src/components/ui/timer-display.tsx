import { cn } from "@/lib/utils";

function formatDuration(seconds: number) {
  return new Date(seconds * 1000).toISOString().substring(11, 19);
}

export function TimerDisplay({
  seconds,
  estimatedMinutes,
  running,
}: {
  seconds: number;
  estimatedMinutes: number;
  running: boolean;
}) {
  const estimatedSeconds = Math.max(estimatedMinutes * 60, 1);
  const completion = Math.min(100, Math.round((seconds / estimatedSeconds) * 100));
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion / 100) * circumference;

  return (
    <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r={radius} className="fill-none stroke-white/15" strokeWidth="10" />
        <circle
          cx="110"
          cy="110"
          r={radius}
          className="fill-none stroke-teal-400 transition-all duration-500"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        className={cn(
          "z-10 flex h-48 w-48 flex-col items-center justify-center rounded-2xl border border-teal-400/20 bg-gradient-to-br from-violet-950/60 to-teal-950/50 backdrop-blur-sm",
          running ? "animate-pulse" : "",
        )}
      >
        <p className="text-4xl font-semibold tracking-wider text-slate-100">{formatDuration(seconds)}</p>
        <p className="mt-2 text-xs text-slate-400">
          {seconds}s elapsed / {estimatedMinutes}m planned
        </p>
        <p className="mt-1 text-sm text-teal-300">{completion}% complete</p>
      </div>
    </div>
  );
}
