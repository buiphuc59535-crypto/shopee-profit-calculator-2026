"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Search,
  Sheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalculations } from "@/hooks/use-calculations";
import { exportCalculationListExcel, exportCalculationListPdf } from "@/lib/export";
import { cn, formatDateTime, formatPercent, formatVnd } from "@/lib/utils";
import type { CalculationRecord } from "@/types/domain";

const PAGE_SIZE = 10;

export function SavedCalculations({ userId }: { userId: string }) {
  const { records, loading } = useCalculations(userId);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

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
  const selectedRecords = useMemo(
    () => filtered.filter((item) => selectedKeys.has(getRecordKey(item))),
    [filtered, selectedKeys],
  );
  const allPageSelected =
    pageRecords.length > 0 && pageRecords.every((item) => selectedKeys.has(getRecordKey(item)));

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setSelectedKeys((current) => {
      const validKeys = new Set(records.map((item) => getRecordKey(item)));
      return new Set([...current].filter((key) => validKeys.has(key)));
    });
  }, [records]);

  function toggleRecord(item: CalculationRecord) {
    const key = getRecordKey(item);
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function togglePageSelection() {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (allPageSelected) {
        pageRecords.forEach((item) => next.delete(getRecordKey(item)));
      } else {
        pageRecords.forEach((item) => next.add(getRecordKey(item)));
      }
      return next;
    });
  }

  function toggleProductName(item: CalculationRecord) {
    const key = getRecordKey(item);
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader className="gap-4">
        <div>
          <CardTitle>Lịch sử đã lưu</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Mỗi trang hiển thị 10 sản phẩm. Quá 10 sản phẩm sẽ tự chuyển sang trang tiếp theo.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(280px,420px)_1fr] lg:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Tìm lịch sử đã lưu"
              className="pl-10"
              placeholder="Tìm theo tên sản phẩm hoặc SKU..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 rounded-2xl border bg-card p-2">
            <span className="mr-auto px-2 text-sm font-semibold text-muted-foreground">
              Đã chọn {selectedRecords.length} sản phẩm
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!selectedRecords.length}
              onClick={() => exportCalculationListExcel(selectedRecords)}
            >
              <Sheet className="h-4 w-4" />
              Tải Excel
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!selectedRecords.length}
              onClick={() => exportCalculationListPdf(selectedRecords)}
            >
              <FileText className="h-4 w-4" />
              Tải PDF
            </Button>
          </div>
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
              <table className="w-full min-w-[2280px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">
                      <input
                        aria-label="Chọn tất cả sản phẩm trên trang"
                        type="checkbox"
                        className="h-5 w-5 rounded border-primary accent-primary"
                        checked={allPageSelected}
                        onChange={togglePageSelection}
                      />
                    </th>
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
                  {pageRecords.map((item, index) => {
                    const key = getRecordKey(item);
                    const expanded = expandedKeys.has(key);
                    const selected = selectedKeys.has(key);

                    return (
                      <tr key={key} className="bg-muted">
                        <td className="rounded-l-2xl px-3 py-3">
                          <input
                            aria-label={`Chọn ${item.productName || "sản phẩm"}`}
                            type="checkbox"
                            className="h-5 w-5 rounded border-primary accent-primary"
                            checked={selected}
                            onChange={() => toggleRecord(item)}
                          />
                        </td>
                        <td className="px-3 py-3 font-black text-primary">
                          {(page - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatDateTime(item.createdAt)}
                          </span>
                        </td>
                        <td className="w-[360px] px-3 py-3">
                          <button
                            type="button"
                            title={item.productName || "Chưa đặt tên"}
                            className={cn(
                              "block w-full text-left font-bold text-foreground",
                              expanded ? "whitespace-normal break-words" : "truncate",
                            )}
                            onClick={() => toggleProductName(item)}
                          >
                            {item.productName || "Chưa đặt tên"}
                          </button>
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
                    );
                  })}
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

function getRecordKey(item: CalculationRecord) {
  return item.id ?? `${item.userId}-${item.productName}-${item.sku ?? ""}-${formatDateTime(item.createdAt)}`;
}
