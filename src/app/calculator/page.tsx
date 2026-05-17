"use client";

import { AppShell } from "@/components/app/app-shell";
import { AuthGate } from "@/components/app/auth-gate";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { SavedCalculations } from "@/components/calculator/saved-calculations";
import { useAuth } from "@/contexts/auth-context";

export const dynamic = "force-dynamic";

export default function CalculatorPage() {
  const { user } = useAuth();

  return (
    <AuthGate>
      <AppShell>
        <div className="mb-5">
          <p className="text-sm font-semibold text-primary">Tính phí</p>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Tính lợi nhuận Sàn Cam 2026</h1>
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

