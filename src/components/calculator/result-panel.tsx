"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CircleHelp, Copy } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfitSignals } from "@/lib/calculator";
import { cn, formatPercent, formatVnd } from "@/lib/utils";
import type { CalculationResult, CalculatorInput } from "@/types/domain";

type ResultRow = [string, string, string];

export function ResultPanel({
  result,
  hasInput = true,
  inputValues,
}: {
  result: CalculationResult;
  hasInput?: boolean;
  inputValues?: CalculatorInput;
}) {
  const signals = getProfitSignals(result);
  const valueOrEmpty = (value: string) => (hasInput ? value : "-");
  const showAds = Number(inputValues?.adsFee ?? 0) > 0;
  const showAff = Number(inputValues?.affFee ?? 0) > 0;
  const showOperation = Number(inputValues?.operationFee ?? 0) > 0;
  const showReturnLoss = Number(inputValues?.returnLossFee ?? 0) > 0;
  const showVoucherShop = Number(inputValues?.voucherShop ?? 0) > 0;
  const headlineItems = [
    ["GIÁ BÁN ĐỀ XUẤT", valueOrEmpty(formatVnd(result.sellingPrice)), "text-red-600"],
    ["GIÁ HÒA VỐN", valueOrEmpty(formatVnd(result.breakEvenPrice)), "text-foreground"],
    ["LÃI THỰC TẾ", valueOrEmpty(formatVnd(result.realProfit)), result.realProfit >= 0 ? "text-emerald-600" : "text-red-600"],
    ["LÃI RÒNG", valueOrEmpty(formatPercent(result.netMargin, 1)), result.netMargin >= 0 ? "text-emerald-600" : "text-red-600"],
  ] as const;
  const rawItems: (ResultRow | null)[] = [
    ["Phí hoa hồng", valueOrEmpty(formatVnd(result.commissionFeeAmount)), "Phí hoa hồng = % hoa hồng x Giá bán."],
    ["Phí giao dịch 6%", valueOrEmpty(formatVnd(result.transactionFeeAmount)), "Phí giao dịch cố định TikTok = 6% x Giá bán."],
    ["Voucher Extra 4%", valueOrEmpty(formatVnd(result.voucherExtraFeeAmount)), "Voucher Extra = 4% x Giá bán."],
    ["Thuế 1.5%", valueOrEmpty(formatVnd(result.taxFeeAmount)), "Thuế = 1.5% x Giá bán."],
    ["Phí xử lý đơn hàng", valueOrEmpty(formatVnd(result.processingFeeAmount)), "Phí xử lý đơn hàng cố định = 3,000đ."],
    ["Hoàn vận chuyển", valueOrEmpty(formatVnd(result.shippingReturnAmount)), "Hoàn vận chuyển cố định = 1,620đ."],
    [
      "Tổng phí sàn",
      valueOrEmpty(formatPercent(result.totalPlatformFeeRate, 1)),
      "Tổng phí sàn TikTok = hoa hồng + giao dịch 6% + Voucher Extra 4% + thuế 1.5%. Không bao gồm phí xử lý đơn hàng và hoàn vận chuyển.",
    ],
    showAds ? ["Phí Ads", valueOrEmpty(formatVnd(result.adsFeeAmount)), "Phí Ads = % Ads x Giá bán."] : null,
    showAff ? ["Phí Aff", valueOrEmpty(formatVnd(result.affFeeAmount)), "Phí Aff = % Aff x Giá bán."] : null,
    showOperation ? ["Vận hành", valueOrEmpty(formatVnd(result.operationFeeAmount)), "Vận hành = % vận hành x Giá bán."] : null,
    showReturnLoss ? ["Hoàn hàng/thất thoát", valueOrEmpty(formatVnd(result.returnLossFeeAmount)), "Hoàn hàng/thất thoát = % x Giá bán."] : null,
    showVoucherShop ? ["Voucher shop", valueOrEmpty(formatVnd(result.voucherShopAmount)), "Voucher shop là số tiền shop tự tài trợ."] : null,
    ["Tổng % phí", valueOrEmpty(formatPercent(result.totalFeeRate, 1)), "Tổng % phí = phí sàn + Ads + Aff + vận hành + hoàn hàng/thất thoát."],
    ["Tiền thực nhận", valueOrEmpty(formatVnd(result.moneyReceived)), "Tiền thực nhận sau các khoản phí, trước khi trừ giá vốn."],
    ["Tổng chi phí", valueOrEmpty(formatVnd(result.totalCost)), "Tổng chi phí = giá vốn + toàn bộ phí cố định và biến đổi."],
  ];
  const items = rawItems.filter((item): item is ResultRow => Boolean(item));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
      <Card className="overflow-hidden dark:bg-slate-900/95">
        <CardHeader className="border-b bg-zinc-950 text-white dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-white">Kết quả cuối</CardTitle>
            <Badge className={cn("border-0", signals.health === "danger" ? "bg-red-600 text-white" : "bg-white/15 text-white dark:bg-white/10 dark:text-white")}>
              {signals.health === "success" ? "Khỏe" : signals.health === "warning" ? "Cần tối ưu" : "Cảnh báo"}
            </Badge>
          </div>
          <div className="grid gap-3 pt-3 sm:grid-cols-2">
            {headlineItems.map(([label, value, className]) => (
              <div key={label} className="rounded-2xl bg-white p-4 text-zinc-950 dark:border dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                <p className="text-[11px] font-black tracking-wide text-zinc-500 dark:text-slate-400">{label}</p>
                <p className={cn("mt-1 text-2xl font-black", className)}>{value}</p>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 border-white/30 bg-white/10 text-white hover:bg-white/20 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            onClick={() => void navigator.clipboard.writeText(Math.round(result.sellingPrice).toString())}
            disabled={result.isInvalid || !hasInput}
          >
            <Copy className="h-4 w-4" />
            Copy giá bán
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {result.isInvalid ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 font-bold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
              Chi phí vượt quá giá bán, vui lòng kiểm tra lại.
            </div>
          ) : null}

          <div className="grid gap-3">
            {items.map(([label, value, formula]) => (
              <div key={label} className="relative flex items-center justify-between gap-4 rounded-xl bg-muted p-3 dark:bg-slate-950/55">
                <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground dark:text-slate-100">
                  <span className="min-w-0 truncate">{label}</span>
                  <FormulaHint label={label} formula={formula} />
                </span>
                <span className="shrink-0 text-right font-bold">{value}</span>
              </div>
            ))}
          </div>

          {hasInput ? (
            <div
              className={cn(
                "rounded-2xl border p-4",
                signals.health === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100",
                signals.health === "warning" && "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
                signals.health === "danger" && "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100",
              )}
            >
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                {signals.health === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                Tín hiệu lợi nhuận
              </div>
              {signals.warnings.length ? (
                <ul className="space-y-1 text-sm">
                  {signals.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">Biên lợi nhuận đang ổn theo dữ liệu đã nhập.</p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FormulaHint({ label, formula }: { label: string; formula: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      className="group/help inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full border border-red-300 bg-white/80 text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white dark:bg-zinc-950/80"
      aria-label={`Công thức ${label}`}
      aria-expanded={open}
      onClick={() => setOpen((current) => !current)}
      onBlur={() => setOpen(false)}
    >
      <CircleHelp className="h-3 w-3" />
      <span
        className={cn(
          "pointer-events-none absolute left-3 right-3 top-full z-20 mt-2 hidden rounded-xl border border-red-200 bg-white p-3 text-left text-xs font-semibold leading-5 text-zinc-800 shadow-xl shadow-zinc-900/10 group-hover/help:block dark:bg-zinc-950 dark:text-zinc-100",
          open && "block",
        )}
      >
        {formula}
      </span>
    </button>
  );
}
