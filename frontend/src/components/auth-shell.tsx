"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { COPY } from "@/lib/copy";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-500/35 blur-[100px]" />
        <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-teal-400/25 blur-[90px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-400/20 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-teal-300 transition hover:text-teal-200">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-teal-400 shadow-lg shadow-violet-900/40">
              <Sparkles className="h-5 w-5 text-white" aria-hidden />
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">FocusFlow</span>
          </Link>
          <p className="mt-3 text-sm text-slate-400">{COPY.brandTagline}</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/[0.08] p-6 shadow-2xl shadow-violet-950/50 backdrop-blur-xl sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-slate-400">{footer}</div>
        </div>
      </div>
    </div>
  );
}
