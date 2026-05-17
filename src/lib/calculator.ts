import type { CalculatorInput, CalculationResult } from "@/types/domain";
import { toRate } from "@/lib/utils";

export const SAN_CAM_FEES = {
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

  const baseVariableRate =
    fixedFeeRate +
    SAN_CAM_FEES.transactionRate +
    SAN_CAM_FEES.householdTaxRate +
    SAN_CAM_FEES.qcRate +
    adsRate +
    returnRate +
    operationRate;

  const fixedCosts =
    costPrice + targetProfit + voucher + SAN_CAM_FEES.infraFee + SAN_CAM_FEES.piShip;
  const uncappedDenominator = 1 - baseVariableRate - SAN_CAM_FEES.voucherXtraRate;
  const uncappedSellPrice =
    uncappedDenominator > 0 ? fixedCosts / uncappedDenominator : 0;
  const voucherXtraIsCapped =
    uncappedSellPrice * SAN_CAM_FEES.voucherXtraRate > SAN_CAM_FEES.voucherXtraMax;
  const cappedDenominator = 1 - baseVariableRate;
  const sellPrice =
    voucherXtraIsCapped && cappedDenominator > 0
      ? (fixedCosts + SAN_CAM_FEES.voucherXtraMax) / cappedDenominator
      : uncappedSellPrice;

  const fixedFee = sellPrice * fixedFeeRate;
  const transactionFee = sellPrice * SAN_CAM_FEES.transactionRate;
  const voucherXtraFee = Math.min(
    sellPrice * SAN_CAM_FEES.voucherXtraRate,
    SAN_CAM_FEES.voucherXtraMax,
  );
  const taxFee = sellPrice * SAN_CAM_FEES.householdTaxRate;
  const qcFee = sellPrice * SAN_CAM_FEES.qcRate;
  const totalFee = fixedFee + transactionFee + voucherXtraFee + taxFee + qcFee;
  const adsFee = sellPrice * adsRate;
  const returnFee = sellPrice * returnRate;
  const operationFee = sellPrice * operationRate;
  const totalVariableCost =
    totalFee +
    adsFee +
    voucher +
    SAN_CAM_FEES.infraFee +
    SAN_CAM_FEES.piShip +
    returnFee +
    operationFee;
  const realProfit =
    sellPrice -
    costPrice -
    totalVariableCost;

  const netMargin = sellPrice > 0 ? (realProfit / sellPrice) * 100 : 0;
  const breakEven = costPrice + totalVariableCost;
  const roas = adsFee > 0 ? sellPrice / adsFee : 0;
  const safeCpc = Math.max(realProfit * 0.12, 0);

  return roundResult({
    sellPrice,
    fixedFee,
    fixedFeePercentAmount: fixedFee,
    transactionFee,
    voucherXtraFee,
    taxFee,
    qcFee,
    infraFee: SAN_CAM_FEES.infraFee,
    piShip: SAN_CAM_FEES.piShip,
    totalFee,
    totalVariableCost,
    adsFee,
    returnFee,
    operationFee,
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
  if (result.netMargin < 8) warnings.push("Biên lợi nhuận thấp, nên tăng giá hoặc giảm ads.");
  if (result.roas > 0 && result.roas < 4) warnings.push("ROAS đang mỏng, cần tối ưu CPC/từ khóa.");
  if (result.realProfit <= 0) warnings.push("Giá này có nguy cơ lỗ sau phí và chi phí vận hành.");

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


