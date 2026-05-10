"use client";
import { FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RuleHint } from "@/components/rule-hint";
import { COPY } from "@/lib/copy";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const dailyFocusGoalMinutes = useSettingsStore((state) => state.dailyFocusGoalMinutes);
  const enableRealtimeNotifications = useSettingsStore(
    (state) => state.enableRealtimeNotifications,
  );
  const compactMobileCards = useSettingsStore((state) => state.compactMobileCards);
  const setDailyFocusGoalMinutes = useSettingsStore(
    (state) => state.setDailyFocusGoalMinutes,
  );
  const setEnableRealtimeNotifications = useSettingsStore(
    (state) => state.setEnableRealtimeNotifications,
  );
  const setCompactMobileCards = useSettingsStore((state) => state.setCompactMobileCards);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    await updateProfile({
      email: email || undefined,
      password: password || undefined,
    });
    form.reset();
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <Card>
          <h2 className="text-lg font-semibold text-slate-100">Profile</h2>
          <p className="mt-1 text-sm text-slate-400">Email and password — change only what you need.</p>
          <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={handleProfileSubmit}>
            <Input
              name="email"
              type="email"
              placeholder={user?.email ?? "Email"}
              defaultValue={user?.email ?? ""}
            />
            <Input name="password" type="password" placeholder="New password (optional)" />
            <Button type="submit">Save Profile</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-100">Preferences</h2>
          <p className="mt-1 text-sm text-slate-400">{COPY.settings.subtitle}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300">Daily focus goal (minutes)</span>
              <Input
                type="number"
                min={30}
                max={720}
                value={dailyFocusGoalMinutes}
                onChange={(event) =>
                  setDailyFocusGoalMinutes(Number(event.target.value || 180))
                }
              />
            </label>
            <div className="space-y-3 rounded-xl border border-teal-400/20 bg-white/[0.06] p-4 text-sm text-slate-300 backdrop-blur-sm">
              <label className="flex items-center justify-between gap-3">
                <span>In-app realtime updates</span>
                <input
                  type="checkbox"
                  checked={enableRealtimeNotifications}
                  onChange={(event) => setEnableRealtimeNotifications(event.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>Compact cards on small screens</span>
                <input
                  type="checkbox"
                  checked={compactMobileCards}
                  onChange={(event) => setCompactMobileCards(event.target.checked)}
                />
              </label>
            </div>
          </div>
          <RuleHint title={COPY.future.reminders} bullets={[COPY.future.aiInsights]} className="mt-6" />
        </Card>
      </div>
    </AppShell>
  );
}
