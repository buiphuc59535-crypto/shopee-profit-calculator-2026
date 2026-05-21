"use client";

import Link from "next/link";
import { BarChart3, Calculator, History, Menu, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/theme-toggle";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Calculator", href: "/calculator", icon: Calculator },
  { label: "History", href: "/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState<boolean | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsEmbedded(params.get("mexo_embed") === "1");
  }, []);

  if (isEmbedded === null || isEmbedded) {
    return (
      <div className="min-h-screen bg-[#eef8ff]">
        <main className="mx-auto min-h-screen max-w-7xl px-4 py-4 pb-10 md:px-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Calculator className="h-5 w-5 text-red-500" />
            </span>
            <span>
              <span className="block text-base font-black leading-tight">TikTok Shop</span>
              <span className="block text-xs font-semibold text-muted-foreground">Profit Calculator 2026</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button key={item.href} asChild variant="ghost">
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label="Menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t bg-card px-4 py-4 shadow-xl lg:hidden">
            <div className="mx-auto grid max-w-7xl gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-bold text-foreground hover:bg-muted"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto min-h-[calc(100vh-4.5rem)] max-w-7xl px-4 py-6 pb-10 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
