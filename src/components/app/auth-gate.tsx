"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) router.replace("/login");
    if (user && isLogin) router.replace("/dashboard");
  }, [isLogin, loading, router, user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
