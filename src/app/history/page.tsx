"use client";

import { useMemo, useState } from "react";
import { Clock, Download, Search } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { AuthGate } from "@/components/app/auth-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useCalculations } from "@/hooks/use-calculations";
import { exportCalculationExcel, exportCalculationPdf } from "@/lib/export";
import { formatDateTime, formatPercent, formatVnd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function HistoryPage() {
  const { user } = useAuth();
  const { records, loading } = useCalculations(user?.uid);
  const [keyword, setKeyword] = useState("");
  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return records;
    return records.filter((item) => {
      const productName = item.productName?.toLowerCase() ?? "";
      const sku = item.sku?.toLowerCase() ?? "";
      return productName.includes(query) || sku.includes(query);
    });
  }, [keyword, records]);

  return (
    <AuthGate>
      <AppShell>
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary">Lịch sử</p>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">Lịch sử tính toán</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm / lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Tìm sản phẩm"
                className="pl-10"
                placeholder="Tìm theo tên sản phẩm hoặc SKU..."
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
            filtered.map((item, index) => (
              <Card key={item.id}>
                <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-muted px-3 py-1 text-sm font-black text-primary">
                        STT {index + 1}
                      </span>
                      <p className="text-lg font-black">{item.productName}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>SKU: <strong className="text-foreground">{item.sku?.trim() || "Chưa nhập"}</strong></span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                      <span>Giá bán: <strong className="text-foreground">{formatVnd(item.sellPrice)}</strong></span>
                      <span>Lãi: <strong className="text-foreground">{formatVnd(item.realProfit)}</strong></span>
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
                  <p className="font-bold">Không có kết quả</p>
                  <p className="mt-1 text-sm text-muted-foreground">Lưu kết quả từ trang Tính phí để hiển thị tại đây.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    </AuthGate>
  );
}

