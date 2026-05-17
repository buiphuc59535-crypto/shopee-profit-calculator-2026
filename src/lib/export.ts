"use client";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import type { CalculationRecord } from "@/types/domain";
import { downloadBlob, formatPercent, formatVnd } from "@/lib/utils";

export async function exportCalculationExcel(record: CalculationRecord) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Shopee Profit Calculator 2026";
  const sheet = workbook.addWorksheet("Profit");

  sheet.columns = [
    { header: "Chi so", key: "label", width: 28 },
    { header: "Gia tri", key: "value", width: 24 },
  ];

  const rows = [
    ["San pham", record.productName || "Chua dat ten"],
    ["1. Phi co dinh", formatVnd(record.fixedFee)],
    ["2. Phi xu ly giao dich 6%", formatVnd(record.transactionFee)],
    ["3. DV Voucher Xtra 5.5% max 50k", formatVnd(record.voucherXtraFee)],
    ["4. Thue HKD tam tinh 1.5%", formatVnd(record.taxFee)],
    ["5. Phi QC co dinh 1%", formatVnd(record.qcFee)],
    ["6. Phi ha tang", formatVnd(record.infraFee)],
    ["7. Phi PI Ship", formatVnd(record.piShip)],
    ["8. Tong phi Shopee", `${formatVnd(record.totalFee)} (${formatPercent(record.effectiveFeeRate)})`],
    ["9. Phi quang cao uoc tinh", formatVnd(record.adsFee)],
    ["10. Voucher shop", formatVnd(record.voucher ?? 0)],
    ["11. Phi hoan hang uoc tinh", formatVnd(record.returnFee)],
    ["12. Phi van hanh uoc tinh", formatVnd(record.operationFee)],
    ["13. Gia von", formatVnd(record.costPrice)],
    ["14. Lai mong muon", formatVnd(record.targetProfit)],
    ["15. Gia ban san pham", formatVnd(record.sellPrice)],
    ["16. Lai thuc te", formatVnd(record.realProfit)],
    ["17. Lai rong", formatPercent(record.netMargin)],
    ["Diem hoa von", formatVnd(record.breakEven)],
    ["ROAS", record.roas.toFixed(2)],
  ];

  sheet.addRows(rows.map(([label, value]) => ({ label, value })));
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEE4D2D" },
  };
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFFED7C4" } },
        left: { style: "thin", color: { argb: "FFFED7C4" } },
        bottom: { style: "thin", color: { argb: "FFFED7C4" } },
        right: { style: "thin", color: { argb: "FFFED7C4" } },
      };
      cell.alignment = { vertical: "middle" };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${slug(record.productName)}-shopee-profit.xlsx`,
  );
}

export function exportCalculationPdf(record: CalculationRecord) {
  const doc = new jsPDF();
  doc.setFillColor(238, 77, 45);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Shopee Profit Calculator 2026", 14, 18);
  doc.setFontSize(10);
  doc.text(record.productName || "San pham chua dat ten", 14, 26);

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  const rows = [
    ["1. Phi co dinh", formatVnd(record.fixedFee)],
    ["2. Phi xu ly giao dich", formatVnd(record.transactionFee)],
    ["3. Voucher Xtra", formatVnd(record.voucherXtraFee)],
    ["4. Thue HKD", formatVnd(record.taxFee)],
    ["5. Phi QC", formatVnd(record.qcFee)],
    ["8. Tong phi Shopee", formatVnd(record.totalFee)],
    ["15. Gia ban san pham", formatVnd(record.sellPrice)],
    ["16. Lai thuc te", formatVnd(record.realProfit)],
    ["17. Lai rong", formatPercent(record.netMargin)],
    ["Diem hoa von", formatVnd(record.breakEven)],
    ["ROAS", record.roas.toFixed(2)],
    ["Safe CPC goi y", formatVnd(record.safeCpc)],
  ];

  let y = 48;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 105, y);
    y += 12;
  });

  doc.setFontSize(9);
  doc.setTextColor(102, 112, 133);
  doc.text("Bao cao tao tu du lieu tinh phi Shopee 2026.", 14, 280);
  doc.save(`${slug(record.productName)}-shopee-profit.pdf`);
}

function slug(value: string) {
  return (value || "calculation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
