"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COPY } from "@/lib/copy";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <AuthShell
      title={COPY.auth.loginTitle}
      subtitle={COPY.auth.loginSubtitle}
      footer={
        <>
          {COPY.auth.footerLoginPrompt}{" "}
          <Link
            href="/register"
            className="font-medium text-teal-300 underline decoration-teal-400/50 underline-offset-2 hover:text-teal-200"
          >
            {COPY.auth.footerLoginLink}
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
            await login(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
            router.push("/");
          } catch (err) {
            setFormError(err instanceof Error ? err.message : "Login failed.");
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
          <Input name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
        </label>
        <Button className="w-full" type="submit">
          {COPY.auth.loginCta}
        </Button>
      </form>
    </AuthShell>
  );
}
