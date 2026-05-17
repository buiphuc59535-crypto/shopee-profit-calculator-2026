"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfitSignals } from "@/lib/calculator";
import { cn, formatPercent, formatVnd } from "@/lib/utils";
import type { CalculationResult } from "@/types/domain";

export function ResultPanel({ result }: { result: CalculationResult }) {
  const signals = getProfitSignals(result);
  const items = [
    ["1. Phi co dinh", formatVnd(result.fixedFee)],
    ["2. Phi xu ly giao dich 6%", formatVnd(result.transactionFee)],
    ["3. DV Voucher Xtra 5.5% max 50k", formatVnd(result.voucherXtraFee)],
    ["4. Thue HKD tam tinh 1.5%", formatVnd(result.taxFee)],
    ["5. Phi QC co dinh 1%", formatVnd(result.qcFee)],
    ["6. Phi ha tang", formatVnd(result.infraFee)],
    ["7. Phi PI Ship", formatVnd(result.piShip)],
    ["8. Tong phi Shopee", `${formatVnd(result.totalFee)} (${formatPercent(result.effectiveFeeRate)})`],
    ["9. Phi quang cao uoc tinh", formatVnd(result.adsFee)],
    ["11. Phi hoan hang uoc tinh", formatVnd(result.returnFee)],
    ["12. Phi van hanh uoc tinh", formatVnd(result.operationFee)],
    ["15. Gia ban san pham", formatVnd(result.sellPrice)],
    ["16. Lai thuc te", formatVnd(result.realProfit)],
    ["17. Lai rong", formatPercent(result.netMargin)],
    ["Diem hoa von", formatVnd(result.breakEven)],
    ["ROAS Ads", result.roas > 0 ? `${result.roas.toFixed(2)}x` : "Khong ads"],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-primary to-orange-500 text-primary-foreground">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-primary-foreground">Ket qua</CardTitle>
            <Badge className="bg-white/20 text-white">
              {signals.health === "success" ? "Tot" : signals.health === "warning" ? "Can toi uu" : "Rui ro"}
            </Badge>
          </div>
          <div className="pt-2">
            <p className="text-3xl font-black leading-tight">{formatVnd(result.sellPrice)}</p>
            <p className="text-sm text-white/85">Gia ban de xuat de dat muc lai muc tieu</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid gap-3">
            {items.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 rounded-xl bg-muted p-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-right font-bold">{value}</span>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "rounded-2xl border p-4",
              signals.health === "success" && "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-100",
              signals.health === "warning" && "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100",
              signals.health === "danger" && "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100",
            )}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-bold">
              {signals.health === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              AI profit signals
            </div>
            {signals.warnings.length ? (
              <ul className="space-y-1 text-sm">
                {signals.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">Bien loi nhuan on dinh. ROAS muc tieu goi y: {signals.suggestedRoas}x.</p>
            )}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Safe CPC tham khao: <strong>{formatVnd(result.safeCpc)}</strong>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
