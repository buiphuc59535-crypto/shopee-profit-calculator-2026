"use client";

import { CircleUserRound, ShieldCheck, Smartphone, TrendingUp } from "lucide-react";
import { AuthGate } from "@/components/app/auth-gate";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { loginWithGoogle, firebaseReady } = useAuth();

  return (
    <AuthGate>
      <main className="min-h-screen bg-background p-4">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col">
          <header className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="font-black">Sàn Cam</p>
                <p className="text-xs text-muted-foreground">Calculator 2026</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="inline-flex rounded-full bg-muted px-3 py-1 text-sm font-semibold text-primary">
                Công cụ cho seller Việt Nam
              </div>
              <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Tính giá bán Sàn Cam 2026 nhanh, rõ lời, đúng phí.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                Gồm phí cố định, giao dịch, Voucher Xtra, thuế HKD, hạ tầng, PI Ship, ads, hoàn hàng và vận hành trong một workflow mobile-first.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Realtime", "Lưu lịch sử bằng Firestore"],
                  ["PWA", "Cài đặt như app mobile"],
                  ["Export", "PDF và Excel cho đội vận hành"],
                ].map(([title, body]) => (
                  <Card key={title}>
                    <CardContent className="p-4">
                      <p className="font-bold">{title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="mx-auto w-full max-w-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-sky-500 p-6 text-primary-foreground">
                <p className="text-sm font-semibold text-white/80">Đăng nhập</p>
                <h2 className="mt-2 text-2xl font-black">Mở tổng quan seller</h2>
              </div>
              <CardContent className="space-y-4 p-6">
                {!firebaseReady ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                    Đang chạy demo mode. Thêm Firebase env trên Vercel để bật Google Login và lưu Firestore thật.
                  </div>
                ) : null}
                <Button className="w-full" size="lg" onClick={loginWithGoogle}>
                  <CircleUserRound className="h-5 w-5" />
                  {firebaseReady ? "Đăng nhập Google" : "Vào app demo"}
                </Button>
                <div className="grid gap-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Firebase Auth và Firestore per-user history.
                  </p>
                  <p className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    Tối ưu touch target và sticky result trên mobile.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </AuthGate>
  );
}

