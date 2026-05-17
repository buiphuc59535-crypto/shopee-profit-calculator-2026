"use client";

export type ParsedFeeCategory = {
  id: string;
  sourceFile: string;
  categoryPath: string;
  feePercent: number;
  rawText: string;
};

export type ParsedFeeDocument = {
  fileName: string;
  fixedFeePercent: number | null;
  categories: ParsedFeeCategory[];
};

export async function extractFixedFeeFromPdf(file: File) {
  const result = await extractFeeConfigFromPdf(file);
  return result.fixedFeePercent;
}

export async function extractFeeConfigsFromPdfs(files: File[]) {
  const results = await Promise.all(files.map((file) => extractFeeConfigFromPdf(file)));
  return {
    documents: results,
    categories: results.flatMap((item) => item.categories),
  };
}

export async function extractFeeConfigFromPdf(file: File): Promise<ParsedFeeDocument> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const data = await file.arrayBuffer();
  const document = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    parts.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }

  const text = normalizeSpace(parts.join(" "));
  const categories = parseFeeCategories(text, file.name);
  const fixedFeePercent = categories[0]?.feePercent ?? findSingleFixedFee(text);

  return {
    fileName: file.name,
    fixedFeePercent,
    categories,
  };
}

function parseFeeCategories(text: string, sourceFile: string): ParsedFeeCategory[] {
  const rows = new Map<string, ParsedFeeCategory>();
  const rowPattern = /(?:^|\s)(\d{1,5})\s+(.{8,260}?)\s+(\d{1,2}(?:[,.]\d{1,2})?)\s*%/g;
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(text)) !== null) {
    const rowNumber = match[1];
    const rawCategory = cleanupCategory(match[2]);
    const feePercent = Number(match[3].replace(",", "."));

    if (
      !rawCategory ||
      isTableHeader(rawCategory) ||
      !Number.isFinite(feePercent) ||
      feePercent <= 0 ||
      feePercent > 80
    ) {
      continue;
    }

    const key = `${sourceFile}-${rowNumber}-${rawCategory}-${feePercent}`;
    if (!rows.has(key)) {
      rows.set(key, {
        id: key,
        sourceFile,
        categoryPath: rawCategory,
        feePercent,
        rawText: `${rowNumber}. ${rawCategory} ${feePercent}%`,
      });
    }
  }

  return [...rows.values()];
}

function findSingleFixedFee(text: string) {
  const plain = stripVietnamese(text);
  const candidates = [
    /phi\s+co\s+dinh[^0-9]{0,60}([0-9]+(?:[,.][0-9]+)?)\s*%/i,
    /fixed\s+fee[^0-9]{0,60}([0-9]+(?:[,.][0-9]+)?)\s*%/i,
    /([0-9]+(?:[,.][0-9]+)?)\s*%\s*phi\s+co\s+dinh/i,
  ];

  for (const pattern of candidates) {
    const match = plain.match(pattern);
    if (match?.[1]) {
      const value = Number(match[1].replace(",", "."));
      if (Number.isFinite(value)) return value;
    }
  }

  return null;
}

function cleanupCategory(value: string) {
  return normalizeSpace(value)
    .replace(/STT\s+Nganh hang cap 1\s+Nganh hang cap 2\s+Nganh hang cap 3/gi, "")
    .replace(/Phi co dinh ap dung tu.+$/gi, "")
    .replace(/Phí cố định áp dụng từ.+$/gi, "")
    .replace(/^\W+|\W+$/g, "")
    .trim();
}

function isTableHeader(value: string) {
  const plain = stripVietnamese(value).toLowerCase();
  return plain.includes("nganh hang cap") || plain.includes("phi co dinh ap dung");
}

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripVietnamese(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
