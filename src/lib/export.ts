"use client";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import type { CalculationRecord } from "@/types/domain";
import { downloadBlob, formatDateTime, formatPercent, formatVnd } from "@/lib/utils";

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

export async function exportCalculationListExcel(records: CalculationRecord[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sàn Cam Calculator 2026";
  const sheet = workbook.addWorksheet("Lịch sử đã chọn");

  sheet.columns = [
    { header: "STT", key: "index", width: 8 },
    { header: "Ngày giờ", key: "createdAt", width: 20 },
    { header: "Sản phẩm", key: "productName", width: 34 },
    { header: "SKU", key: "sku", width: 18 },
    { header: "Phí cố định", key: "fixedFee", width: 18 },
    { header: "Phí xử lý giao dịch 6%", key: "transactionFee", width: 22 },
    { header: "Voucher Xtra 5.5%", key: "voucherXtraFee", width: 22 },
    { header: "Thuế HKD 1.5%", key: "taxFee", width: 18 },
    { header: "Phí quảng cáo cố định 1%", key: "qcFee", width: 24 },
    { header: "Phí hạ tầng", key: "infraFee", width: 16 },
    { header: "Phí PI Ship", key: "piShip", width: 16 },
    { header: "Tổng phí Shopee", key: "totalFee", width: 20 },
    { header: "Phí quảng cáo ước tính", key: "adsFee", width: 24 },
    { header: "Voucher shop ước tính", key: "voucher", width: 24 },
    { header: "Phí hoàn hàng ước tính", key: "returnFee", width: 24 },
    { header: "Phí vận hành ước tính", key: "operationFee", width: 24 },
    { header: "Giá vốn", key: "costPrice", width: 16 },
    { header: "Lãi mong muốn", key: "targetProfit", width: 18 },
    { header: "Giá bán sản phẩm", key: "sellPrice", width: 20 },
    { header: "Lãi thực tế", key: "realProfit", width: 18 },
    { header: "Lãi ròng", key: "netMargin", width: 14 },
  ];

  sheet.addRows(
    records.map((record, index) => ({
      index: index + 1,
      createdAt: formatDateTime(record.createdAt),
      productName: record.productName || "Chưa đặt tên",
      sku: record.sku || "Chưa nhập",
      fixedFee: `${formatVnd(record.fixedFee)} (${formatPercent(record.fixedFeePercent, 1)})`,
      transactionFee: formatVnd(record.transactionFee),
      voucherXtraFee: formatVnd(record.voucherXtraFee),
      taxFee: formatVnd(record.taxFee),
      qcFee: formatVnd(record.qcFee),
      infraFee: formatVnd(record.infraFee),
      piShip: formatVnd(record.piShip),
      totalFee: `${formatVnd(record.totalFee)} (${formatPercent(record.effectiveFeeRate)})`,
      adsFee: formatVnd(record.adsFee),
      voucher: formatVnd(record.voucher ?? 0),
      returnFee: formatVnd(record.returnFee),
      operationFee: formatVnd(record.operationFee),
      costPrice: formatVnd(record.costPrice),
      targetProfit: formatVnd(record.targetProfit),
      sellPrice: formatVnd(record.sellPrice),
      realProfit: formatVnd(record.realProfit),
      netMargin: formatPercent(record.netMargin),
    })),
  );

  styleSheet(sheet);
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `san-cam-lich-su-${records.length}-san-pham.xlsx`,
  );
}

export function exportCalculationListPdf(records: CalculationRecord[]) {
  const doc = new jsPDF();

  records.forEach((record, index) => {
    if (index > 0) doc.addPage();
    doc.setFillColor(21, 94, 239);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(`Sàn Cam Calculator 2026 - #${index + 1}`, 14, 17);
    doc.setFontSize(9);
    doc.text(formatDateTime(record.createdAt), 14, 25);

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(10);
    const rows = [
      ["Sản phẩm", record.productName || "Chưa đặt tên"],
      ["SKU", record.sku || "Chưa nhập"],
      ["Phí cố định", `${formatVnd(record.fixedFee)} (${formatPercent(record.fixedFeePercent, 1)})`],
      ["Phí xử lý giao dịch 6%", formatVnd(record.transactionFee)],
      ["Voucher Xtra 5.5%", formatVnd(record.voucherXtraFee)],
      ["Thuế HKD 1.5%", formatVnd(record.taxFee)],
      ["Phí quảng cáo cố định 1%", formatVnd(record.qcFee)],
      ["Phí hạ tầng", formatVnd(record.infraFee)],
      ["Phí PI Ship", formatVnd(record.piShip)],
      ["Tổng phí Shopee", formatVnd(record.totalFee)],
      ["Phí quảng cáo ước tính", formatVnd(record.adsFee)],
      ["Voucher shop ước tính", formatVnd(record.voucher ?? 0)],
      ["Phí hoàn hàng ước tính", formatVnd(record.returnFee)],
      ["Phí vận hành ước tính", formatVnd(record.operationFee)],
      ["Giá vốn", formatVnd(record.costPrice)],
      ["Lãi mong muốn", formatVnd(record.targetProfit)],
      ["Giá bán sản phẩm", formatVnd(record.sellPrice)],
      ["Lãi thực tế", formatVnd(record.realProfit)],
      ["Lãi ròng", formatPercent(record.netMargin)],
    ];

    let y = 42;
    rows.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value).slice(0, 70), 88, y);
      y += 11;
    });
  });

  doc.save(`san-cam-lich-su-${records.length}-san-pham.pdf`);
}

function styleSheet(sheet: ExcelJS.Worksheet) {
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
      cell.alignment = { vertical: "middle", wrapText: true };
    });
  });
}

function slug(value: string) {
  return (value || "calculation")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


