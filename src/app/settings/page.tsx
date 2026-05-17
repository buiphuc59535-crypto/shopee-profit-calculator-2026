"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { AuthGate } from "@/components/app/auth-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { saveFeeConfig } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const { user, firebaseReady, demoMode } = useAuth();
  const [fixedFeePercent, setFixedFeePercent] = useState(8);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveFeeConfig({ userId: user.uid, fixedFeePercent, source: "manual" });
      setMessage("Da luu fee config vao collection fee_configs.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGate>
      <AppShell>
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary">Settings</p>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Cau hinh he thong</h1>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fee config</CardTitle>
              <CardDescription>Luu ty le phi co dinh mac dinh vao Firestore.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Fixed fee %"
                type="number"
                step="0.1"
                value={fixedFeePercent}
                onChange={(event) => setFixedFeePercent(Number(event.target.value))}
              />
              <Button onClick={save} loading={saving}>
                <Save className="h-4 w-4" />
                {demoMode ? "Demo save" : "Save fee config"}
              </Button>
              {message ? <p className="text-sm font-semibold text-primary">{message}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Firebase status</CardTitle>
              <CardDescription>Collections dung trong app production.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {["users", "calculations", "fee_configs", "ads_reports", "settings"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-xl bg-muted p-3">
                  <span className="font-semibold">{item}/</span>
                  <span className="text-muted-foreground">{firebaseReady ? "ready" : "waiting env"}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </AuthGate>
  );
}
