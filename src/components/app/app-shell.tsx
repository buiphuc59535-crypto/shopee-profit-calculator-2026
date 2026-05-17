"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calculator,
  History,
  LogOut,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/app/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/calculator", label: "Tinh phi", icon: Calculator },
  { href: "/history", label: "Lich su", icon: History },
  { href: "/settings", label: "Cai dat", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card/90 p-4 backdrop-blur lg:block">
        <Brand />
        <nav className="mt-8 grid gap-2">
          {navItems.map((item) => (
            <NavLink key={item.href} active={pathname === item.href} {...item} />
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="rounded-2xl bg-muted p-3">
            <p className="truncate text-sm font-semibold">{user?.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Dang xuat
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="lg:hidden">
              <Brand compact />
            </div>
            <div className="hidden text-sm text-muted-foreground lg:block">
              Shopee Profit Calculator 2026
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="icon" onClick={logout} aria-label="Dang xuat">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-8rem)] max-w-7xl px-4 py-5 pb-24 md:px-6 md:py-8 lg:pb-8">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t bg-card/95 p-2 backdrop-blur lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold text-muted-foreground",
                  active && "bg-primary text-primary-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <ShoppingBag className="h-5 w-5" />
      </span>
      {!compact ? (
        <span>
          <span className="block text-base font-black leading-tight">Shopee Profit</span>
          <span className="block text-xs font-semibold text-muted-foreground">Calculator 2026</span>
        </span>
      ) : null}
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
        active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
