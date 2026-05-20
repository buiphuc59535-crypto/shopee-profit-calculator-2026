"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, RotateCcw, Save, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ResultPanel } from "@/components/calculator/result-panel";
import { ADS_OPTIONS, calculateProfit } from "@/lib/calculator";
import { saveCalculation, saveFeeConfig } from "@/lib/firestore";
import type { ParsedFeeCategory } from "@/lib/pdf-fee-parser";
import { cn } from "@/lib/utils";
import type { CalculationRecord, ShopType } from "@/types/domain";

const schema = z.object({
  productName: z.string().optional().default(""),
  sku: z.string().optional().default(""),
  shopType: z.enum(["manual", "regular", "mall"]).default("regular"),
  costPrice: z.coerce.number().min(0),
  desiredProfit: z.coerce.number().min(0),
  commissionFee: z.coerce.number().min(0).max(80),
  adsFee: z.coerce.number().min(0).max(80),
  voucherShop: z.coerce.number().min(0).optional().default(0),
  affFee: z.coerce.number().min(0).max(80).optional().default(0),
  operationFee: z.coerce.number().min(0).max(80).optional().default(0),
  returnLossFee: z.coerce.number().min(0).max(80).optional().default(0),
  autoRound: z.boolean().optional().default(true),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const defaults: FormValues = {
  productName: "",
  sku: "",
  shopType: "manual",
  costPrice: 0,
  desiredProfit: 0,
  commissionFee: 0,
  adsFee: 0,
  voucherShop: 0,
  affFee: 0,
  operationFee: 0,
  returnLossFee: 0,
  autoRound: true,
};

const shopTypeOptions: { value: ShopType; label: string; hint: string }[] = [
  { value: "manual", label: "Tự nhập %", hint: "Chỉnh trực tiếp phí hoa hồng" },
  { value: "regular", label: "Shop thường", hint: "Đọc từ PDF phí TikTok" },
  { value: "mall", label: "Shop Mall", hint: "Đọc từ PDF phí TikTok Mall" },
];

function parseMoneyInput(value: string) {
  const normalized = value.replace(/[^\d]/g, "");
  return normalized ? Number(normalized) : 0;
}

function formatMoneyInput(value: number | undefined) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return new Intl.NumberFormat("vi-VN").format(amount);
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSearchTokens(value: string) {
  return normalizeSearch(value).split(/\s+/).filter(Boolean);
}

export function CalculatorForm({ userId }: { userId: string }) {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [parsedCategories, setParsedCategories] = useState<ParsedFeeCategory[]>([]);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ParsedFeeCategory | null>(null);

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onChange",
  });
  const watchedValues = form.watch();
  const values = useMemo(() => {
    const parsed = schema.safeParse(watchedValues);
    return parsed.success ? parsed.data : defaults;
  }, [watchedValues]);
  const result = useMemo(() => calculateProfit(values), [values]);
  const hasMeaningfulInput =
    values.commissionFee > 0 ||
    values.adsFee > 0 ||
    (values.affFee ?? 0) > 0 ||
    (values.operationFee ?? 0) > 0 ||
    (values.returnLossFee ?? 0) > 0 ||
    (values.voucherShop ?? 0) > 0 ||
    values.costPrice > 0 ||
    values.desiredProfit > 0;
  const record: CalculationRecord = {
    ...values,
    ...result,
    userId,
    createdAt: new Date().toISOString(),
  };

  const filteredCategories = useMemo(() => {
    const tokens = getSearchTokens(categoryQuery);
    if (!tokens.length) return [];
    return parsedCategories
      .filter((category) => {
        const searchable = normalizeSearch(category.categoryPath);
        return tokens.every((token) => searchable.includes(token));
      })
      .slice(0, 24);
  }, [categoryQuery, parsedCategories]);

  useEffect(() => {
    async function loadBuiltInFeeData() {
      try {
        const response = await fetch(`/fee-data/tiktok-platform.json?v=${Date.now()}`);
        if (!response.ok) throw new Error("Không tải được dữ liệu phí hoa hồng.");
        const data = (await response.json()) as { categories: ParsedFeeCategory[] };
        setParsedCategories(data.categories);
      } catch {
        setToast("Chưa tải được dữ liệu phí hoa hồng. Vui lòng kiểm tra file dữ liệu trong public/fee-data.");
      }
    }

    void loadBuiltInFeeData();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    form.setValue("commissionFee", getCategoryFee(selectedCategory, values.shopType), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form, selectedCategory, values.shopType]);

  async function handleSave() {
    const valid = await form.trigger();
    if (!valid || result.isInvalid) return;
    setSaving(true);
    try {
      await saveCalculation(record);
      setToast("Đã lưu lịch sử tính toán.");
    } finally {
      setSaving(false);
    }
  }

  function applyCategory(category: ParsedFeeCategory) {
    const commissionFee = getCategoryFee(category, values.shopType);
    form.setValue("commissionFee", commissionFee, { shouldDirty: true, shouldValidate: true });
    setSelectedCategory(category);
    setCategoryQuery("");
    void saveFeeConfig({
      userId,
      shopType: values.shopType,
      commissionFee,
      source: "pdf",
      fileName: category.sourceFile,
      categoryName: category.categoryPath,
    });
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50 dark:border-slate-700 dark:bg-slate-950/70">
            <CardTitle>Tính phí & lợi nhuận TikTok Shop 2026</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 pt-5">
            <section className="grid gap-4 md:grid-cols-2">
              <Input label="Tên sản phẩm" placeholder="VD: Son kem phiên bản mới" {...form.register("productName")} />
              <Input label="SKU / mã hàng" placeholder="VD: TTS-001" {...form.register("sku")} />
            </section>

            <section className="grid gap-4 rounded-2xl border bg-background/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <SectionTitle
                title="1. Phí hoa hồng (%)"
                description="Tự nhập hoặc chọn shop và chọn ngành hàng"
              />

              <div className="grid gap-2 text-sm font-bold text-foreground dark:text-white">
                <div className="grid gap-3 md:grid-cols-3">
                  {shopTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "rounded-2xl border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary dark:bg-slate-950/45 dark:hover:bg-slate-900",
                        values.shopType === option.value && "border-primary bg-red-50 text-red-700 dark:bg-red-950/35 dark:text-red-100",
                      )}
                      onClick={() => {
                        form.setValue("shopType", option.value, { shouldDirty: true });
                        if (option.value === "manual") {
                          setSelectedCategory(null);
                          setCategoryQuery("");
                        }
                      }}
                    >
                      <span className="flex items-center gap-2 font-black">
                        {values.shopType === option.value ? <Check className="h-4 w-4" /> : null}
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs font-semibold text-muted-foreground">{option.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl border border-red-100 bg-red-50/40 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                <PercentField
                  label="Phí hoa hồng đang áp dụng"
                  placeholder="Tự nhập hoặc chọn shop và chọn ngành hàng."
                  value={values.commissionFee}
                  onChange={(value) => form.setValue("commissionFee", value, { shouldValidate: true })}
                />
              </div>

              {values.shopType !== "manual" && parsedCategories.length ? (
                <div className="grid gap-3">
                  <label className="grid gap-2 text-sm font-bold text-foreground dark:text-white">
                    Chọn ngành hàng
                    <span className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        aria-label="Tìm ngành hàng"
                        className="h-14 w-full rounded-2xl border bg-card px-10 text-base font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-950/45 dark:text-slate-50 dark:placeholder:text-slate-400"
                        placeholder="Nhập tên ngành, ví dụ: laptop, mỹ phẩm, thời trang..."
                        value={categoryQuery}
                        onChange={(event) => setCategoryQuery(event.target.value)}
                      />
                    </span>
                  </label>

                  {categoryQuery.trim() ? (
                    <div className="max-h-80 overflow-auto rounded-2xl border bg-card shadow-lg dark:border-slate-700 dark:bg-slate-950">
                      {filteredCategories.length ? (
                        filteredCategories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            className="grid w-full gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-muted dark:border-slate-800 dark:hover:bg-slate-900 lg:grid-cols-[minmax(0,1fr)_124px_124px] lg:items-center"
                            onClick={() => applyCategory(category)}
                          >
                            <span className="block min-w-0 text-sm font-semibold leading-6 sm:text-[15px]">
                              <HighlightedText
                                text={category.categoryPath}
                                query={categoryQuery}
                              />
                              <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                                Đang chọn: {values.shopType === "mall" ? "Shop Mall" : "Shop thường"}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "rounded-2xl border px-3 py-2 text-center",
                                values.shopType === "regular"
                                  ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <span className="block text-[11px] font-black uppercase">Shop thường</span>
                              <span className="block text-lg font-black">
                                {formatFee(category.standardFeePercent ?? category.feePercent)}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "rounded-2xl border px-3 py-2 text-center",
                                values.shopType === "mall"
                                  ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <span className="block text-[11px] font-black uppercase">Shop Mall</span>
                              <span className="block text-lg font-black">
                                {formatFee(category.mallFeePercent ?? category.feePercent)}
                              </span>
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-3 text-sm font-semibold text-muted-foreground">Không tìm thấy ngành phù hợp.</p>
                      )}
                    </div>
                  ) : null}

                  {selectedCategory ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900/60 dark:bg-red-950/25">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase text-red-600">Ngành đang áp dụng</p>
                          <p className="mt-2 text-base font-black text-foreground">
                            {selectedCategory.categoryPath}
                          </p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div
                              className={cn(
                                "rounded-xl border px-3 py-2",
                                values.shopType === "regular"
                                  ? "border-red-300 bg-white text-red-700 dark:border-red-800 dark:bg-red-950/45 dark:text-red-100"
                                  : "bg-white/60 text-muted-foreground dark:border-slate-700 dark:bg-slate-950/65",
                              )}
                            >
                              <p className="text-[11px] font-black uppercase">Shop thường</p>
                              <p className="text-xl font-black">
                                {formatFee(selectedCategory.standardFeePercent ?? selectedCategory.feePercent)}
                              </p>
                            </div>
                            <div
                              className={cn(
                                "rounded-xl border px-3 py-2",
                                values.shopType === "mall"
                                  ? "border-red-300 bg-white text-red-700 dark:border-red-800 dark:bg-red-950/45 dark:text-red-100"
                                  : "bg-white/60 text-muted-foreground dark:border-slate-700 dark:bg-slate-950/65",
                              )}
                            >
                              <p className="text-[11px] font-black uppercase">Shop Mall</p>
                              <p className="text-xl font-black">
                                {formatFee(selectedCategory.mallFeePercent ?? selectedCategory.feePercent)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-2xl leading-none text-muted-foreground hover:text-foreground"
                          aria-label="Bỏ ngành đang áp dụng"
                          onClick={() => setSelectedCategory(null)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="grid gap-3 rounded-2xl border bg-background/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <SectionTitle title="Chi phí đầu vào" description="(tự điền theo mô hình kinh doanh của bạn)" inline />
              <div className="grid gap-4 md:grid-cols-2">
                <MoneyField label="9. Voucher shop" placeholder="0" value={values.voucherShop} onChange={(value) => form.setValue("voucherShop", value, { shouldValidate: true })} />
                <PercentField label="10. Phí Aff (%)" value={values.affFee} onChange={(value) => form.setValue("affFee", value, { shouldValidate: true })} />
                <PercentField label="11. Vận hành (%)" value={values.operationFee} onChange={(value) => form.setValue("operationFee", value, { shouldValidate: true })} />
                <PercentField label="12. Hoàn hàng/thất thoát (%)" value={values.returnLossFee} onChange={(value) => form.setValue("returnLossFee", value, { shouldValidate: true })} />
                <MoneyField label="13. Giá vốn" value={values.costPrice} onChange={(value) => form.setValue("costPrice", value, { shouldValidate: true })} />
                <MoneyField label="14. Lãi mong muốn" value={values.desiredProfit} onChange={(value) => form.setValue("desiredProfit", value, { shouldValidate: true })} />
              </div>
            </section>

            <section className="grid gap-3 rounded-2xl border bg-background/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
              <SectionTitle title="8. Phí Ads (%)" description="Chọn một mức nhanh." />
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {ADS_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={values.adsFee === option ? "default" : "outline"}
                    onClick={() => form.setValue("adsFee", option, { shouldDirty: true, shouldValidate: true })}
                  >
                    {option}%
                  </Button>
                ))}
              </div>
            </section>

            {result.isInvalid ? (
              <div className="rounded-2xl border border-red-300 bg-red-50 p-4 font-bold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                Chi phí vượt quá giá bán, vui lòng kiểm tra lại.
              </div>
            ) : null}

            {toast ? <p className="rounded-2xl border bg-card p-3 text-sm font-semibold text-foreground">{toast}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-3 pt-5 sm:grid-cols-2">
            <Button type="button" onClick={handleSave} loading={saving} disabled={result.isInvalid}>
              <Save className="h-4 w-4" />
              Lưu
            </Button>
            <Button type="button" variant="secondary" onClick={() => form.reset(defaults)}>
              <RotateCcw className="h-4 w-4" />
              Đặt lại
            </Button>
          </CardContent>
        </Card>
      </form>

      <aside className="xl:sticky xl:top-24">
        <ResultPanel result={result} hasInput={hasMeaningfulInput} inputValues={values} />
      </aside>
    </div>
  );
}

function getCategoryFee(category: ParsedFeeCategory, shopType: ShopType) {
  if (shopType === "mall") return category.mallFeePercent ?? category.feePercent;
  return category.standardFeePercent ?? category.feePercent;
}

function formatFee(value: number) {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}%`;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const tokens = getSearchTokens(query);
  if (!tokens.length) return <>{text}</>;

  const parts = text.split(/(\s+|[-–—/,&()]+)/);
  return (
    <>
      {parts.map((part, index) => {
        const matched = tokens.some((token) => normalizeSearch(part).includes(token));
        return matched ? (
          <mark key={`${part}-${index}`} className="rounded bg-red-100 px-1 font-black text-red-700 dark:bg-red-950/60 dark:text-red-200">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        );
      })}
    </>
  );
}

function MoneyField({
  label,
  placeholder = "100,000",
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  return (
    <Input
      label={label}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={formatMoneyInput(value)}
      onChange={(event) => onChange(parseMoneyInput(event.target.value))}
    />
  );
}

function PercentField({
  label,
  value,
  placeholder = "0",
  onChange,
}: {
  label: string;
  value: number | undefined;
  placeholder?: string;
  onChange: (value: number) => void;
}) {
  const amount = Number(value ?? 0);
  const displayValue = Number.isFinite(amount) && amount > 0 ? String(amount) : "";

  return (
    <Input
      label={label}
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={displayValue}
      onChange={(event) => {
        const parsed = Number(event.target.value.replace(",", "."));
        onChange(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
      }}
    />
  );
}

function SectionTitle({
  title,
  description,
  inline = false,
}: {
  title: string;
  description: string;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h3 className="text-base font-black text-foreground dark:text-white">{title}</h3>
        <p className="text-xs font-semibold text-muted-foreground">{description}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-black text-foreground dark:text-white">{title}</h3>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">{description}</p>
    </div>
  );
}
