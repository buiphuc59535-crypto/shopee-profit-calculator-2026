"use client";

import { useMemo, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPercent, formatVnd } from "@/lib/utils";

type FormState = {
  productName: string;
  sku: string;
  fixedFeePercent: string;
  adsPercent: string;
  affPercent: string;
  voucherShop: string;
  returnPercent: string;
  operationPercent: string;
  costPrice: string;
  targetProfit: string;
};

const emptyForm: FormState = {
  productName: "",
  sku: "",
  fixedFeePercent: "",
  adsPercent: "",
  affPercent: "",
  voucherShop: "",
  returnPercent: "",
  operationPercent: "",
  costPrice: "",
  targetProfit: "",
};

const ADS_OPTIONS = ["", "0", "3", "5", "10", "15", "20"];

export function SanCamStandaloneCalculator() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const result = useMemo(() => calculateSanCam(form), [form]);
  const hasInput = toNumber(form.costPrice) > 0 || toNumber(form.targetProfit) > 0;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-[#eef8ff] px-4 py-6 text-[#07152f] md:px-8">
      <div className="mx-auto grid max-w-7xl items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid gap-5">
          <div>
            <p className="text-sm font-black text-primary">Sàn Cam Calculator 2026</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
              Tính chi phí & lợi nhuận Sàn Cam
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input
                label="Tên sản phẩm"
                placeholder="Áo thun MEXO GROUP..."
                value={form.productName}
                onChange={(event) => update("productName", event.target.value)}
              />
              <Input
                label="SKU / Mã sản phẩm"
                placeholder="VD: AO-THUN-001"
                value={form.sku}
                onChange={(event) => update("sku", event.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Giá vốn - lãi mong muốn{" "}
                <span className="text-sm font-bold text-red-500">
                  (Hai chỉ số chính để app tính giá bán đề xuất)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <MoneyInput label="14. Giá vốn" value={form.costPrice} onChange={(value) => update("costPrice", value)} />
              <MoneyInput label="15. Lãi mong muốn" value={form.targetProfit} onChange={(value) => update("targetProfit", value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Phí theo mô hình kinh doanh{" "}
                <span className="text-sm font-bold text-red-500">
                  (tự điền theo mô hình kinh doanh của bạn)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <PercentInput
                label="1. Phí cố định %"
                value={form.fixedFeePercent}
                onChange={(value) => update("fixedFeePercent", value)}
              />
              <label className="grid gap-2 text-sm font-bold">
                9. Phí Ads %
                <select
                  className="h-12 rounded-xl border bg-card px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={form.adsPercent}
                  onChange={(event) => update("adsPercent", event.target.value)}
                >
                  {ADS_OPTIONS.map((option) => (
                    <option key={option || "empty"} value={option}>
                      {option ? `${option}%` : "Không chọn"}
                    </option>
                  ))}
                </select>
              </label>
              <MoneyInput label="10. Voucher shop" value={form.voucherShop} onChange={(value) => update("voucherShop", value)} />
              <PercentInput label="11. Phí Aff %" value={form.affPercent} onChange={(value) => update("affPercent", value)} />
              <PercentInput label="12. Hoàn hàng %" value={form.returnPercent} onChange={(value) => update("returnPercent", value)} />
              <PercentInput label="13. Vận hành %" value={form.operationPercent} onChange={(value) => update("operationPercent", value)} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <Button type="button" variant="secondary" onClick={() => setForm(emptyForm)}>
                <RotateCcw className="h-4 w-4" />
                Đặt lại
              </Button>
            </CardContent>
          </Card>
        </section>

        <aside className="xl:sticky xl:top-6">
          <ResultPanel result={result} form={form} hasInput={hasInput} />
        </aside>
      </div>
    </main>
  );
}

function ResultPanel({
  result,
  form,
  hasInput,
}: {
  result: ReturnType<typeof calculateSanCam>;
  form: FormState;
  hasInput: boolean;
}) {
  const value = (amount: number) => (hasInput ? formatVnd(amount) : "-");
  const rows = [
    ["1. Phí cố định", value(result.fixedFee)],
    ["2. Phí xử lý giao dịch 6%", value(result.transactionFee)],
    ["3. Voucher Xtra 5.5%", value(result.voucherXtraFee)],
    ["4. Thuế HKD tạm tính 1.5%", value(result.taxFee)],
    ["5. Phí quảng cáo cố định 1%", value(result.qcFee)],
    ["6. Phí hạ tầng", value(result.infraFee)],
    ["7. Phí PiShip", value(result.piShip)],
    ["8. Tổng phí Sàn Cam", hasInput ? `${formatVnd(result.totalFee)} (${formatPercent(result.effectiveFeeRate)})` : "-"],
    toNumber(form.adsPercent) > 0 ? ["9. Phí quảng cáo ước tính", value(result.adsFee)] : null,
    toNumber(form.voucherShop) > 0 ? ["10. Voucher shop ước tính", value(result.voucherShop)] : null,
    toNumber(form.affPercent) > 0 ? ["11. Phí Aff ước tính", value(result.affFee)] : null,
    toNumber(form.returnPercent) > 0 ? ["12. Phí hoàn hàng ước tính", value(result.returnFee)] : null,
    toNumber(form.operationPercent) > 0 ? ["13. Phí vận hành ước tính", value(result.operationFee)] : null,
    ["16. Giá bán sản phẩm", value(result.sellPrice)],
    ["17. Lãi thực tế", value(result.realProfit)],
    ["18. Lãi ròng", hasInput ? formatPercent(result.netMargin) : "-"],
    ["Giá bán hòa vốn", value(result.breakEven)],
    toNumber(form.adsPercent) > 0 ? ["ROAS Ads", `${result.roas.toFixed(2)}x`] : null,
  ].filter((row): row is [string, string] => Boolean(row));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary to-sky-500 text-white">
        <CardTitle className="text-white">Kết quả</CardTitle>
        <p className="text-3xl font-black">{value(result.sellPrice)}</p>
        <p className="text-sm text-white/85">Giá bán đề xuất để đạt mức lãi mục tiêu</p>
      </CardHeader>
      <CardContent className="grid gap-3 pt-5">
        {rows.map(([label, rowValue]) => (
          <div key={label} className="flex items-center justify-between gap-4 rounded-xl bg-sky-100 p-3">
            <span className="text-sm font-medium text-slate-600">{label}</span>
            <span className="text-right font-black">{rowValue}</span>
          </div>
        ))}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          <Calculator className="mr-2 inline h-4 w-4" />
          Các dòng phí tự điền chỉ hiện khi giá trị lớn hơn 0.
        </div>
      </CardContent>
    </Card>
  );
}

function calculateSanCam(form: FormState) {
  const costPrice = toNumber(form.costPrice);
  const targetProfit = toNumber(form.targetProfit);
  const fixedFeeRate = toNumber(form.fixedFeePercent) / 100;
  const adsRate = toNumber(form.adsPercent) / 100;
  const affRate = toNumber(form.affPercent) / 100;
  const returnRate = toNumber(form.returnPercent) / 100;
  const operationRate = toNumber(form.operationPercent) / 100;
  const voucherShop = toNumber(form.voucherShop);
  const infraFee = 3000;
  const piShip = 2700;
  const baseRate = fixedFeeRate + 0.06 + 0.015 + 0.01 + adsRate + affRate + returnRate + operationRate;
  const fixedCosts = costPrice + targetProfit + voucherShop + infraFee + piShip;
  const uncappedDenominator = 1 - baseRate - 0.055;
  const uncappedSellPrice = uncappedDenominator > 0 ? fixedCosts / uncappedDenominator : 0;
  const voucherXtraCapped = uncappedSellPrice * 0.055 > 50000;
  const cappedDenominator = 1 - baseRate;
  const sellPrice = voucherXtraCapped && cappedDenominator > 0 ? (fixedCosts + 50000) / cappedDenominator : uncappedSellPrice;
  const fixedFee = sellPrice * fixedFeeRate;
  const transactionFee = sellPrice * 0.06;
  const voucherXtraFee = Math.min(sellPrice * 0.055, 50000);
  const taxFee = sellPrice * 0.015;
  const qcFee = sellPrice * 0.01;
  const totalFee = fixedFee + transactionFee + voucherXtraFee + taxFee + qcFee;
  const adsFee = sellPrice * adsRate;
  const affFee = sellPrice * affRate;
  const returnFee = sellPrice * returnRate;
  const operationFee = sellPrice * operationRate;
  const realProfit = sellPrice - costPrice - totalFee - adsFee - affFee - returnFee - operationFee - voucherShop - infraFee - piShip;
  const netMargin = sellPrice > 0 ? (realProfit / sellPrice) * 100 : 0;
  const breakEven = costPrice + totalFee + adsFee + affFee + returnFee + operationFee + voucherShop + infraFee + piShip;
  const roas = adsFee > 0 ? sellPrice / adsFee : 0;

  return round({
    sellPrice,
    fixedFee,
    transactionFee,
    voucherXtraFee,
    taxFee,
    qcFee,
    infraFee,
    piShip,
    totalFee,
    adsFee,
    affFee,
    voucherShop,
    returnFee,
    operationFee,
    realProfit,
    netMargin,
    breakEven,
    roas,
    effectiveFeeRate: sellPrice > 0 ? (totalFee / sellPrice) * 100 : 0,
  });
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      label={label}
      inputMode="numeric"
      placeholder="Tự điền"
      value={value}
      onChange={(event) => onChange(formatNumberInput(event.target.value))}
    />
  );
}

function PercentInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      label={label}
      inputMode="decimal"
      placeholder="Tự điền"
      value={value}
      onChange={(event) => onChange(event.target.value.replace(",", ".").replace(/[^0-9.]/g, ""))}
    />
  );
}

function toNumber(value: string | number | undefined) {
  const parsed = Number(String(value ?? "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatNumberInput(value: string) {
  const raw = value.replace(/[^\d]/g, "");
  return raw ? new Intl.NumberFormat("vi-VN").format(Number(raw)) : "";
}

function round<T extends Record<string, number>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).map(([key, amount]) => [key, Math.round(amount * 100) / 100]),
  ) as T;
}
