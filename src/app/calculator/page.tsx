"use client";

import { AppShell } from "@/components/app/app-shell";
import { AuthGate } from "@/components/app/auth-gate";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import { useAuth } from "@/contexts/auth-context";

export const dynamic = "force-dynamic";

export default function CalculatorPage() {
  const { user } = useAuth();

  return (
    <AuthGate>
      <AppShell>
        <div className="mb-5">
          <p className="text-sm font-semibold text-primary">Calculator</p>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Tinh loi nhuan Shopee 2026</h1>
        </div>
        {user ? <CalculatorForm userId={user.uid} /> : null}
      </AppShell>
    </AuthGate>
  );
}
