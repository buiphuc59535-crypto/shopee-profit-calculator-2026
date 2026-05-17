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
import {
  extractFeeConfigsFromPdfs,
  type ParsedFeeCategory,
} from "@/lib/pdf-fee-parser";
import { formatVnd } from "@/lib/utils";
import type { CalculationRecord } from "@/types/domain";

const schema = z.object({
  productName: z.string().min(1, "Nhập tên sản phẩm"),
  sku: z.string().optional().default(""),
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
  productName: "Sản phẩm demo",
  sku: "",
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
  const [parsedCategories, setParsedCategories] = useState<ParsedFeeCategory[]>([]);
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
          sku: typeof watchedValues.sku === "string" ? watchedValues.sku : "",
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
      setMessage("Đã lưu vào lịch sử tính toán.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePdf(files?: FileList | null) {
    const pdfFiles = Array.from(files ?? []).filter((file) => file.type === "application/pdf");
    if (!pdfFiles.length) return;
    setPdfLoading(true);
    setMessage(null);
    try {
      const parsed = await extractFeeConfigsFromPdfs(pdfFiles);
      setParsedCategories(parsed.categories);
      const firstCategory = parsed.categories[0];
      if (!firstCategory) {
        setMessage("Không tìm thấy bảng phí cố định trong PDF. Hãy nhập thủ công.");
        return;
      }
      applyPdfCategory(firstCategory);
      await saveFeeConfig({
        userId,
        fixedFeePercent: firstCategory.feePercent,
        source: "pdf",
        fileName: firstCategory.sourceFile,
        categoryName: firstCategory.categoryPath,
      });
      setMessage(
        `Đã đọc ${parsed.categories.length} ngành hàng từ ${pdfFiles.length} file PDF. Đang áp dụng dòng đầu tiên, bạn có thể chọn lại ngành hàng bên dưới.`,
      );
    } finally {
      setPdfLoading(false);
    }
  }

  function applyPdfCategory(category: ParsedFeeCategory) {
    form.setValue("fixedFeePercent", category.feePercent, { shouldValidate: true });
  }

  async function handlePdfCategoryChange(categoryId: string) {
    const category = parsedCategories.find((item) => item.id === categoryId);
    if (!category) return;
    applyPdfCategory(category);
    await saveFeeConfig({
      userId,
      fixedFeePercent: category.feePercent,
      source: "pdf",
      fileName: category.sourceFile,
      categoryName: category.categoryPath,
    });
    setMessage(`Đã áp dụng phí cố định ${category.feePercent}% cho ngành: ${category.categoryPath}.`);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardHeader>
          <CardTitle>Tính giá bán tự động</CardTitle>
          <CardDescription>
            Người dùng chỉ cần nhập các mục 1, 9, 10, 11, 12, 13, 14. Các mục còn lại app tự tính theo rule Sàn Cam 2026.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <div className="md:col-span-2">
              <Input label="Tên sản phẩm" placeholder="Áo thun local brand" {...form.register("productName")} />
            </div>
            <div className="md:col-span-2">
              <Input label="SKU / Mã sản phẩm" placeholder="VD: AO-THUN-001" {...form.register("sku")} />
            </div>
            <Input label="13. Giá vốn" type="number" inputMode="numeric" {...form.register("costPrice")} />
            <Input label="14. Lãi mong muốn" type="number" inputMode="numeric" {...form.register("targetProfit")} />
            <Input label="1. Phí cố định %" type="number" inputMode="decimal" step="0.1" {...form.register("fixedFeePercent")} />
            <Select label="9. Phí ads %" {...form.register("adsPercent")}>
              {ADS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}%
                </option>
              ))}
            </Select>
            <Input label="10. Voucher shop" type="number" inputMode="numeric" {...form.register("voucher")} />
            <Input label="11. Hoàn hàng %" type="number" inputMode="decimal" step="0.1" {...form.register("returnPercent")} />
            <Input label="12. Vận hành %" type="number" inputMode="decimal" step="0.1" {...form.register("operationPercent")} />

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Upload PDF phí cố định Sàn Cam
              <span className="flex h-12 items-center gap-3 rounded-xl border bg-card px-3">
                <FileSearch className="h-4 w-4 text-primary" />
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="w-full text-sm"
                  disabled={pdfLoading}
                  onChange={(event) => handlePdf(event.target.files)}
                />
              </span>
            </label>

            {parsedCategories.length ? (
              <div className="md:col-span-2">
                <Select
                  label="Chọn ngành hàng đọc từ PDF"
                  onChange={(event) => handlePdfCategoryChange(event.target.value)}
                  defaultValue={parsedCategories[0]?.id}
                >
                  {parsedCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.sourceFile} - {category.categoryPath} - {category.feePercent}%
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}

            <div className="md:col-span-2">
              <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                15. Giá bán sản phẩm: <strong className="text-foreground">{formatVnd(result.sellPrice)}</strong>. Mục 3 được tính đúng rule MIN(giá bán x 5.5%, 50.000đ).
              </div>
            </div>

            {message ? <p className="md:col-span-2 text-sm font-semibold text-primary">{message}</p> : null}

            <div className="grid gap-3 md:col-span-2 md:grid-cols-4">
              <Button type="button" onClick={handleSave} loading={saving}>
                <Save className="h-4 w-4" />
                Lưu
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
                Đặt lại
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
            <span className="text-sm font-semibold text-muted-foreground">Giá bán đề xuất</span>
            <span className="text-xl font-black text-primary">{formatVnd(result.sellPrice)}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <span className="rounded-xl bg-muted p-2">Lãi {formatVnd(result.realProfit)}</span>
            <span className="rounded-xl bg-muted p-2">Margin {result.netMargin.toFixed(1)}%</span>
            <span className="rounded-xl bg-muted p-2">ROAS {result.roas.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

