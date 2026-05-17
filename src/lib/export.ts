"use client";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import type { CalculationRecord } from "@/types/domain";
import { downloadBlob, formatPercent, formatVnd } from "@/lib/utils";

export async function exportCalculationExcel(record: CalculationRecord) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sàn Cam Calculator 2026";
  const sheet = workbook.addWorksheet("Lợi nhuận");

  sheet.columns = [
    { header: "Chỉ số", key: "label", width: 32 },
    { header: "Giá trị", key: "value", width: 24 },
  ];

  const rows = [
    ["Sản phẩm", record.productName || "Chưa đặt tên"],
    ["SKU", record.sku || "Chưa nhập"],
    ["1. Phí cố định", formatVnd(record.fixedFee)],
    ["2. Phí xử lý giao dịch 6%", formatVnd(record.transactionFee)],
    ["3. Voucher Xtra 5.5% (max 50k/1SP)", formatVnd(record.voucherXtraFee)],
    ["4. Thuế HKD tạm tính 1.5%", formatVnd(record.taxFee)],
    ["5. Phí quảng cáo cố định 1%", formatVnd(record.qcFee)],
    ["6. Phí hạ tầng", formatVnd(record.infraFee)],
    ["7. Phí PI Ship", formatVnd(record.piShip)],
    ["8. Tổng phí Sàn Cam", `${formatVnd(record.totalFee)} (${formatPercent(record.effectiveFeeRate)})`],
    ["9. Phí quảng cáo ước tính", formatVnd(record.adsFee)],
    ["10. Voucher shop", formatVnd(record.voucher ?? 0)],
    ["11. Phí hoàn hàng ước tính", formatVnd(record.returnFee)],
    ["12. Phí vận hành ước tính", formatVnd(record.operationFee)],
    ["13. Giá vốn", formatVnd(record.costPrice)],
    ["14. Lãi mong muốn", formatVnd(record.targetProfit)],
    ["15. Giá bán sản phẩm", formatVnd(record.sellPrice)],
    ["16. Lãi thực tế", formatVnd(record.realProfit)],
    ["17. Lãi ròng", formatPercent(record.netMargin)],
    ["Điểm hòa vốn", formatVnd(record.breakEven)],
    ["ROAS", record.roas.toFixed(2)],
  ];

  sheet.addRows(rows.map(([label, value]) => ({ label, value })));
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF155EEF" },
  };
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFBAE6FD" } },
        left: { style: "thin", color: { argb: "FFBAE6FD" } },
        bottom: { style: "thin", color: { argb: "FFBAE6FD" } },
        right: { style: "thin", color: { argb: "FFBAE6FD" } },
      };
      cell.alignment = { vertical: "middle" };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${slug(record.productName)}-san-cam-profit.xlsx`,
  );
}

export function exportCalculationPdf(record: CalculationRecord) {
  const doc = new jsPDF();
  doc.setFillColor(21, 94, 239);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Sàn Cam Calculator 2026", 14, 18);
  doc.setFontSize(10);
  doc.text(record.productName || "Sản phẩm chưa đặt tên", 14, 26);

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  const rows = [
    ["SKU", record.sku || "Chưa nhập"],
    ["1. Phí cố định", formatVnd(record.fixedFee)],
    ["2. Phí xử lý giao dịch", formatVnd(record.transactionFee)],
    ["3. Voucher Xtra", formatVnd(record.voucherXtraFee)],
    ["4. Thuế HKD", formatVnd(record.taxFee)],
    ["5. Phí QC", formatVnd(record.qcFee)],
    ["8. Tổng phí Sàn Cam", formatVnd(record.totalFee)],
    ["15. Giá bán sản phẩm", formatVnd(record.sellPrice)],
    ["16. Lãi thực tế", formatVnd(record.realProfit)],
    ["17. Lãi ròng", formatPercent(record.netMargin)],
    ["Điểm hòa vốn", formatVnd(record.breakEven)],
    ["ROAS", record.roas.toFixed(2)],
    ["Safe CPC gợi ý", formatVnd(record.safeCpc)],
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
  doc.text("Báo cáo tạo từ dữ liệu tính phí Sàn Cam 2026.", 14, 280);
  doc.save(`${slug(record.productName)}-san-cam-profit.pdf`);
}

function slug(value: string) {
  return (value || "calculation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


