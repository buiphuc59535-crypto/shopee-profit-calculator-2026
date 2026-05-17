"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileSearch, RotateCcw, Save, Sheet, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ResultPanel } from "@/components/calculator/result-panel";
import { ADS_OPTIONS, calculateProfit } from "@/lib/calculator";
import { exportCalculationExcel, exportCalculationPdf } from "@/lib/export";
import { saveCalculation, saveFeeConfig } from "@/lib/firestore";
import { extractFixedFeeFromPdf } from "@/lib/pdf-fee-parser";
import { formatVnd } from "@/lib/utils";
import type { CalculationRecord } from "@/types/domain";

const schema = z.object({
  productName: z.string().min(1, "Nhap ten san pham"),
  costPrice: z.coerce.number().min(0),
  targetProfit: z.coerce.number().min(0),
  fixedFeePercent: z.coerce.number().min(0).max(80),
  adsPercent: z.coerce.number().min(0).max(80),
  voucher: z.coerce.number().min(0).optional().default(0),
  returnPercent: z.coerce.number().min(0).max(80).optional().default(0),
  operationPercent: z.coerce.number().min(0).max(80).optional().default(0),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const defaults: FormValues = {
  productName: "San pham demo",
  costPrice: 120000,
  targetProfit: 45000,
  fixedFeePercent: 8,
  adsPercent: 10,
  voucher: 0,
  returnPercent: 0,
  operationPercent: 0,
};

export function CalculatorForm({ userId }: { userId: string }) {
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onChange",
  });
  const watchedValues = form.watch();
  const values = useMemo(() => {
    const parsed = schema.safeParse(watchedValues);
    return parsed.success
      ? parsed.data
      : {
          ...defaults,
          productName:
            typeof watchedValues.productName === "string" ? watchedValues.productName : "",
        };
  }, [watchedValues]);
  const result = useMemo(() => calculateProfit(values), [values]);
  const record: CalculationRecord = {
    ...values,
    ...result,
    userId,
    createdAt: new Date(),
  };

  async function handleSave() {
    const valid = await form.trigger();
    if (!valid) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveCalculation(record);
      setMessage("Da luu vao lich su tinh toan.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePdf(file?: File) {
    if (!file) return;
    setPdfLoading(true);
    setMessage(null);
    try {
      const fee = await extractFixedFeeFromPdf(file);
      if (fee === null) {
        setMessage("Khong tim thay phi co dinh trong PDF. Hay nhap thu cong.");
        return;
      }
      form.setValue("fixedFeePercent", fee, { shouldValidate: true });
      await saveFeeConfig({ userId, fixedFeePercent: fee, source: "pdf", fileName: file.name });
      setMessage(`Da doc phi co dinh ${fee}% tu PDF va luu cau hinh.`);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardHeader>
          <CardTitle>Tinh gia ban tu dong</CardTitle>
          <CardDescription>
            User chi can nhap cac muc 1, 9, 10, 11, 12, 13, 14. Cac muc con lai app tu tinh theo rule Shopee 2026.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <div className="md:col-span-2">
              <Input label="Ten san pham" placeholder="Ao thun local brand" {...form.register("productName")} />
            </div>
            <Input label="13. Gia von" type="number" inputMode="numeric" {...form.register("costPrice")} />
            <Input label="14. Lai mong muon" type="number" inputMode="numeric" {...form.register("targetProfit")} />
            <Input label="1. Phi co dinh %" type="number" inputMode="decimal" step="0.1" {...form.register("fixedFeePercent")} />
            <Select label="9. Phi ads %" {...form.register("adsPercent")}>
              {ADS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}%
                </option>
              ))}
            </Select>
            <Input label="10. Voucher shop" type="number" inputMode="numeric" {...form.register("voucher")} />
            <Input label="11. Hoan hang %" type="number" inputMode="decimal" step="0.1" {...form.register("returnPercent")} />
            <Input label="12. Van hanh %" type="number" inputMode="decimal" step="0.1" {...form.register("operationPercent")} />

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Upload PDF phi co dinh Shopee
              <span className="flex h-12 items-center gap-3 rounded-xl border bg-card px-3">
                <FileSearch className="h-4 w-4 text-primary" />
                <input
                  type="file"
                  accept="application/pdf"
                  className="w-full text-sm"
                  disabled={pdfLoading}
                  onChange={(event) => handlePdf(event.target.files?.[0])}
                />
              </span>
            </label>

            <div className="md:col-span-2">
              <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                15. Gia ban san pham: <strong className="text-foreground">{formatVnd(result.sellPrice)}</strong>. Muc 3 duoc tinh dung rule MIN(gia ban x 5.5%, 50.000d).
              </div>
            </div>

            {message ? <p className="md:col-span-2 text-sm font-semibold text-primary">{message}</p> : null}

            <div className="grid gap-3 md:col-span-2 md:grid-cols-4">
              <Button type="button" onClick={handleSave} loading={saving}>
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button type="button" variant="outline" onClick={() => exportCalculationPdf(record)}>
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button type="button" variant="outline" onClick={() => exportCalculationExcel(record)}>
                <Sheet className="h-4 w-4" />
                Excel
              </Button>
              <Button type="button" variant="secondary" onClick={() => form.reset(defaults)}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="hidden lg:block">
        <ResultPanel result={result} />
      </div>

      <div className="fixed inset-x-0 bottom-[72px] z-20 px-4 lg:hidden">
        <div className="rounded-2xl border bg-card p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Gia ban de xuat</span>
            <span className="text-xl font-black text-primary">{formatVnd(result.sellPrice)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <span className="rounded-xl bg-muted p-2">Lai {formatVnd(result.realProfit)}</span>
            <span className="rounded-xl bg-muted p-2">Margin {result.netMargin.toFixed(1)}%</span>
            <span className="rounded-xl bg-muted p-2">ROAS {result.roas.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
