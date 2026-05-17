"use client";

import { useMemo, useState } from "react";
import { Clock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalculations } from "@/hooks/use-calculations";
import { formatDateTime, formatPercent, formatVnd } from "@/lib/utils";

export function SavedCalculations({ userId }: { userId: string }) {
  const { records, loading } = useCalculations(userId);
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
    <Card>
      <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Lịch sử đã lưu</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Mỗi lần bấm Lưu sẽ tạo một dòng theo tên sản phẩm/SKU, kèm số thứ tự và thời gian.
          </p>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Tìm lịch sử đã lưu"
            className="pl-10"
            placeholder="Tìm theo tên sản phẩm hoặc SKU..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">STT</th>
                  <th className="px-3 py-2">Ngày giờ</th>
                  <th className="px-3 py-2">Sản phẩm / SKU</th>
                  <th className="px-3 py-2 text-right">Giá bán</th>
                  <th className="px-3 py-2 text-right">Lãi thực tế</th>
                  <th className="px-3 py-2 text-right">Lãi ròng</th>
                  <th className="px-3 py-2 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr key={item.id ?? `${item.productName}-${index}`} className="bg-muted">
                    <td className="rounded-l-2xl px-3 py-3 font-black text-primary">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDateTime(item.createdAt)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold">{item.productName || "Chưa đặt tên"}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.sku?.trim() || "Chưa nhập"}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.sellPrice)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.realProfit)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatPercent(item.netMargin)}</td>
                    <td className="rounded-r-2xl px-3 py-3 text-right font-bold">
                      {item.roas.toFixed(2)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-44 items-center justify-center rounded-2xl bg-muted text-center">
            <div>
              <p className="font-bold">Chưa có bản ghi phù hợp</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nhập thông tin sản phẩm rồi bấm Lưu để tạo lịch sử bên dưới.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
