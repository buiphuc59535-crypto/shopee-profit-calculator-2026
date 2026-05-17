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
    ["Gia ban de xuat", formatVnd(result.sellPrice)],
    ["Tong phi Shopee", formatVnd(result.totalFee)],
    ["Phi ads", formatVnd(result.adsFee)],
    ["Lai thuc te", formatVnd(result.realProfit)],
    ["Bien lai rong", formatPercent(result.netMargin)],
    ["Diem hoa von", formatVnd(result.breakEven)],
    ["ROAS", result.roas > 0 ? result.roas.toFixed(2) : "Khong ads"],
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
            {items.slice(1).map(([label, value]) => (
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
