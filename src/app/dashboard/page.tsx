"use client";

import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calculator, History, Plus, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { AuthGate } from "@/components/app/auth-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useCalculations } from "@/hooks/use-calculations";
import { formatPercent, formatVnd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { user } = useAuth();
  const { records, loading, stats } = useCalculations(user?.uid);
  const chartData = records.slice(0, 8).reverse().map((item) => ({
    name: item.productName.slice(0, 12) || "SP",
    margin: Number(item.netMargin.toFixed(1)),
    profit: Math.round(item.realProfit),
  }));

  return (
    <AuthGate>
      <AppShell>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Dashboard</p>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">Tong quan loi nhuan</h1>
          </div>
          <Button asChild>
            <Link href="/calculator">
              <Plus className="h-4 w-4" />
              Tinh san pham moi
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric title="Tong lan tinh" value={stats.total.toString()} icon={Calculator} />
          <Metric title="Avg margin" value={formatPercent(stats.avgMargin)} icon={TrendingUp} />
          <Metric title="Avg ROAS" value={stats.avgRoas ? `${stats.avgRoas.toFixed(2)}x` : "0x"} icon={BarChart} />
          <Metric title="Tong loi uoc tinh" value={formatVnd(stats.totalProfit)} icon={History} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader>
              <CardTitle>Margin gan day</CardTitle>
              <CardDescription>Bieu do realtime tu Firestore calculations.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-72" />
              ) : chartData.length ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="margin" fill="#ee4d2d" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent calculations</CardTitle>
              <CardDescription>5 san pham moi nhat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </>
              ) : records.length ? (
                records.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-xl bg-muted p-3">
                    <div className="flex justify-between gap-3">
                      <p className="truncate font-bold">{item.productName}</p>
                      <p className="font-bold text-primary">{formatVnd(item.realProfit)}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Gia ban {formatVnd(item.sellPrice)} · Margin {item.netMargin.toFixed(1)}%
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState compact />
              )}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </AuthGate>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-black">{value}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function EmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex h-52 flex-col items-center justify-center rounded-2xl bg-muted text-center">
      <p className="font-bold">Chua co du lieu</p>
      {!compact ? <p className="mt-1 text-sm text-muted-foreground">Hay tinh va luu san pham dau tien.</p> : null}
    </div>
  );
}
