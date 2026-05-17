import type { CalculatorInput, CalculationResult } from "@/types/domain";
import { toRate } from "@/lib/utils";

export const SHOPEE_FEES = {
  transactionRate: 0.06,
  voucherXtraRate: 0.055,
  voucherXtraMax: 50000,
  householdTaxRate: 0.015,
  qcRate: 0.01,
  infraFee: 3000,
  piShip: 2700,
} as const;

export const ADS_OPTIONS = [3, 5, 10, 15, 20] as const;

export function calculateProfit(input: CalculatorInput): CalculationResult {
  const costPrice = positive(input.costPrice);
  const targetProfit = positive(input.targetProfit);
  const voucher = positive(input.voucher);
  const fixedFeeRate = toRate(input.fixedFeePercent);
  const adsRate = toRate(input.adsPercent);
  const returnRate = toRate(input.returnPercent);
  const operationRate = toRate(input.operationPercent);

  const variableRate =
    fixedFeeRate +
    SHOPEE_FEES.transactionRate +
    SHOPEE_FEES.voucherXtraRate +
    SHOPEE_FEES.householdTaxRate +
    SHOPEE_FEES.qcRate +
    adsRate +
    returnRate +
    operationRate;

  const denominator = 1 - variableRate;
  const sellPrice =
    denominator > 0
      ? (costPrice +
          targetProfit +
          voucher +
          SHOPEE_FEES.infraFee +
          SHOPEE_FEES.piShip) /
        denominator
      : 0;

  const fixedFee = sellPrice * fixedFeeRate;
  const transactionFee = sellPrice * SHOPEE_FEES.transactionRate;
  const voucherXtraFee = Math.min(
    sellPrice * SHOPEE_FEES.voucherXtraRate,
    SHOPEE_FEES.voucherXtraMax,
  );
  const taxFee = sellPrice * SHOPEE_FEES.householdTaxRate;
  const qcFee = sellPrice * SHOPEE_FEES.qcRate;
  const totalFee = fixedFee + transactionFee + voucherXtraFee + taxFee + qcFee;
  const adsFee = sellPrice * adsRate;
  const returnFee = sellPrice * returnRate;
  const operationFee = sellPrice * operationRate;
  const realProfit =
    sellPrice -
    totalFee -
    adsFee -
    voucher -
    costPrice -
    SHOPEE_FEES.infraFee -
    SHOPEE_FEES.piShip -
    returnFee -
    operationFee;

  const netMargin = sellPrice > 0 ? (realProfit / sellPrice) * 100 : 0;
  const breakEven =
    costPrice +
    totalFee +
    adsFee +
    voucher +
    SHOPEE_FEES.infraFee +
    SHOPEE_FEES.piShip +
    returnFee +
    operationFee;
  const roas = adsFee > 0 ? sellPrice / adsFee : 0;
  const safeCpc = Math.max(realProfit * 0.12, 0);

  return roundResult({
    sellPrice,
    fixedFee,
    transactionFee,
    voucherXtraFee,
    taxFee,
    qcFee,
    infraFee: SHOPEE_FEES.infraFee,
    piShip: SHOPEE_FEES.piShip,
    totalFee,
    adsFee,
    realProfit,
    netMargin,
    breakEven,
    roas,
    safeCpc,
    effectiveFeeRate: sellPrice > 0 ? (totalFee / sellPrice) * 100 : 0,
  });
}

export function getProfitSignals(result: CalculationResult) {
  const warnings: string[] = [];
  if (result.netMargin < 8) warnings.push("Bien loi nhuan thap, nen tang gia hoac giam ads.");
  if (result.roas > 0 && result.roas < 4) warnings.push("ROAS dang mong, can toi uu CPC/tu khoa.");
  if (result.realProfit <= 0) warnings.push("Gia nay co nguy co lo sau phi va chi phi van hanh.");

  return {
    health:
      result.realProfit <= 0 ? "danger" : result.netMargin < 12 ? "warning" : "success",
    warnings,
    suggestedRoas: result.netMargin >= 15 ? 5 : 7,
  } as const;
}

function positive(value: number | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function roundResult(result: CalculationResult): CalculationResult {
  return Object.fromEntries(
    Object.entries(result).map(([key, value]) => [key, Math.round(value * 100) / 100]),
  ) as CalculationResult;
}
