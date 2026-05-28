import type { Timestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatar: string | null;
  createdAt: Timestamp | Date;
};

export type CalculatorInput = {
  productName: string;
  sku?: string;
  costPrice: number;
  targetProfit: number;
  fixedFeePercent: number;
  adsPercent: number;
  voucher?: number;
  returnPercent?: number;
  operationPercent?: number;
};

export type CalculationResult = {
  sellPrice: number;
  fixedFee: number;
  fixedFeePercentAmount: number;
  transactionFee: number;
  voucherXtraFee: number;
  taxFee: number;
  qcFee: number;
  infraFee: number;
  piShip: number;
  totalFee: number;
  totalVariableCost: number;
  adsFee: number;
  returnFee: number;
  operationFee: number;
  realProfit: number;
  netMargin: number;
  breakEven: number;
  roas: number;
  safeCpc: number;
  effectiveFeeRate: number;
};

export type CalculationRecord = CalculatorInput &
  CalculationResult & {
    id?: string;
    userId: string;
    createdAt: Timestamp | Date;
  };

export type FeeConfig = {
  id?: string;
  userId: string;
  fixedFeePercent: number;
  source: "manual" | "pdf";
  fileName?: string;
  categoryName?: string;
  createdAt: Timestamp | Date;
};


export type ShopType = "manual" | "regular" | "mall";
