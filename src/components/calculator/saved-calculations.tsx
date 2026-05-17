"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalculations } from "@/hooks/use-calculations";
import { formatDateTime, formatPercent, formatVnd } from "@/lib/utils";

const PAGE_SIZE = 10;

export function SavedCalculations({ userId }: { userId: string }) {
  const { records, loading } = useCalculations(userId);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return records;
    return records.filter((item) => {
      const productName = item.productName?.toLowerCase() ?? "";
      const sku = item.sku?.toLowerCase() ?? "";
      return productName.includes(query) || sku.includes(query);
    });
  }, [keyword, records]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <Card>
      <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Lịch sử đã lưu</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Mỗi trang hiển thị 10 sản phẩm. Quá 10 sản phẩm sẽ tự chuyển sang trang tiếp theo.
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
          <div className="grid gap-4">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[2200px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">STT</th>
                  <th className="px-3 py-2">Ngày giờ</th>
                  <th className="px-3 py-2">Sản phẩm / SKU</th>
                  <th className="px-3 py-2 text-right">Phí cố định</th>
                  <th className="px-3 py-2 text-right">Phí xử lý giao dịch 6%</th>
                  <th className="px-3 py-2 text-right">Voucher Xtra 5.5%</th>
                  <th className="px-3 py-2 text-right">Thuế HKD 1.5%</th>
                  <th className="px-3 py-2 text-right">Phí quảng cáo cố định 1%</th>
                  <th className="px-3 py-2 text-right">Phí hạ tầng</th>
                  <th className="px-3 py-2 text-right">Phí PI Ship</th>
                  <th className="px-3 py-2 text-right">Tổng phí Shopee</th>
                  <th className="px-3 py-2 text-right">Phí quảng cáo ước tính</th>
                  <th className="px-3 py-2 text-right">Voucher shop ước tính</th>
                  <th className="px-3 py-2 text-right">Phí hoàn hàng ước tính</th>
                  <th className="px-3 py-2 text-right">Phí vận hành ước tính</th>
                  <th className="px-3 py-2 text-right">Giá vốn</th>
                  <th className="px-3 py-2 text-right">Lãi mong muốn</th>
                  <th className="px-3 py-2 text-right">Giá bán</th>
                  <th className="px-3 py-2 text-right">Lãi thực tế</th>
                  <th className="px-3 py-2 text-right">Lãi ròng</th>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((item, index) => (
                  <tr key={item.id ?? `${item.productName}-${index}`} className="bg-muted">
                    <td className="rounded-l-2xl px-3 py-3 font-black text-primary">
                      {(page - 1) * PAGE_SIZE + index + 1}
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
                    <td className="px-3 py-3 text-right font-bold">
                      {formatVnd(item.fixedFee)}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({formatPercent(item.fixedFeePercent, 1)})
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.transactionFee)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.voucherXtraFee)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.taxFee)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.qcFee)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.infraFee)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.piShip)}</td>
                    <td className="px-3 py-3 text-right font-bold">
                      {formatVnd(item.totalFee)}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({formatPercent(item.effectiveFeeRate)})
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.adsFee)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.voucher ?? 0)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.returnFee)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.operationFee)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.costPrice)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.targetProfit)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.sellPrice)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatVnd(item.realProfit)}</td>
                    <td className="rounded-r-2xl px-3 py-3 text-right font-bold">
                      {formatPercent(item.netMargin)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-muted p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-muted-foreground">
                Hiển thị {pageRecords.length} / {filtered.length} sản phẩm - Trang {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
