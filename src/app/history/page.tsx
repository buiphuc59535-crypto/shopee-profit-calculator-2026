"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { AuthGate } from "@/components/app/auth-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useCalculations } from "@/hooks/use-calculations";
import { exportCalculationExcel, exportCalculationPdf } from "@/lib/export";
import { formatPercent, formatVnd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function HistoryPage() {
  const { user } = useAuth();
  const { records, loading } = useCalculations(user?.uid);
  const [keyword, setKeyword] = useState("");
  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return records;
    return records.filter((item) => item.productName.toLowerCase().includes(query));
  }, [keyword, records]);

  return (
    <AuthGate>
      <AppShell>
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary">History</p>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Lich su tinh toan</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search/filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Tim san pham"
                className="pl-10"
                placeholder="Tim theo ten san pham..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 grid gap-3">
          {loading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : filtered.length ? (
            filtered.map((item) => (
              <Card key={item.id}>
                <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-lg font-black">{item.productName}</p>
                    <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                      <span>Gia ban: <strong className="text-foreground">{formatVnd(item.sellPrice)}</strong></span>
                      <span>Lai: <strong className="text-foreground">{formatVnd(item.realProfit)}</strong></span>
                      <span>Margin: <strong className="text-foreground">{formatPercent(item.netMargin)}</strong></span>
                      <span>ROAS: <strong className="text-foreground">{item.roas.toFixed(2)}x</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportCalculationPdf(item)}>
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportCalculationExcel(item)}>
                      <Download className="h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex h-52 items-center justify-center text-center">
                <div>
                  <p className="font-bold">Khong co ket qua</p>
                  <p className="mt-1 text-sm text-muted-foreground">Luu calculation tu trang Calculator de hien thi tai day.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    </AuthGate>
  );
}
