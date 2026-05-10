"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Expandable help — uses native <details> so no React state needed. */
export function RuleHint({
  title,
  bullets,
  className,
}: {
  title: string;
  bullets: readonly string[];
  className?: string;
}) {
  return (
    <details
      className={cn(
        "group rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/15 to-teal-600/10 px-4 py-3 text-sm text-slate-300 backdrop-blur-sm",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-teal-100 [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-violet-300 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-3 space-y-2 border-t border-white/10 pt-3 text-slate-400">
        {bullets.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="text-amber-300/90" aria-hidden>
              ·
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
