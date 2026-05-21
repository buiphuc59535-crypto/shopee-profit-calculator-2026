"use client";

import { AppShell } from "@/components/app/app-shell";
import { AuthGate } from "@/components/app/auth-gate";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { SavedCalculations } from "@/components/calculator/saved-calculations";
import { useAuth } from "@/contexts/auth-context";

export default function CalculatorPage() {
  const { user } = useAuth();

  return (
    <AuthGate>
      <AppShell>
        <div className="mb-5">
          <h1 className="bg-gradient-to-r from-zinc-950 to-red-600 bg-clip-text text-2xl font-black tracking-tight text-transparent dark:from-white dark:via-white dark:to-white md:text-3xl">
            App tính phí & lợi nhuận TikTok Shop 2026
          </h1>
        </div>
        {user ? (
          <div className="grid gap-5">
            <CalculatorForm userId={user.uid} />
            <SavedCalculations userId={user.uid} />
          </div>
        ) : null}
      </AppShell>
    </AuthGate>
  );
}
