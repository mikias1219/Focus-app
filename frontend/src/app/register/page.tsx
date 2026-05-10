"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COPY } from "@/lib/copy";
import { useAuthStore } from "@/stores/auth-store";

export default function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <AuthShell
      title={COPY.auth.registerTitle}
      subtitle={COPY.auth.registerSubtitle}
      footer={
        <>
          {COPY.auth.footerRegisterPrompt}{" "}
          <Link
            href="/login"
            className="font-medium text-teal-300 underline decoration-teal-400/50 underline-offset-2 hover:text-teal-200"
          >
            {COPY.auth.footerRegisterLink}
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setFormError(null);
          const formData = new FormData(event.currentTarget);
          try {
            await register(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
            router.push("/");
          } catch (err) {
            setFormError(err instanceof Error ? err.message : "Registration failed.");
          }
        }}
      >
        {formError ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100">
            {formError}
          </p>
        ) : null}
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</span>
          <Input name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Password</span>
          <Input
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <span className="text-xs text-slate-500">{COPY.auth.passwordMinHint}</span>
        </label>
        <Button className="w-full" type="submit">
          {COPY.auth.registerCta}
        </Button>
      </form>
    </AuthShell>
  );
}
