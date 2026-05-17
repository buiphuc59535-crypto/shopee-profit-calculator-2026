"use client";

export async function extractFixedFeeFromPdf(file: File) {
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

  const text = parts.join(" ");
  const candidates = [
    /phi\s+co\s+dinh[^0-9]{0,30}([0-9]+(?:[,.][0-9]+)?)\s*%/i,
    /fixed\s+fee[^0-9]{0,30}([0-9]+(?:[,.][0-9]+)?)\s*%/i,
    /([0-9]+(?:[,.][0-9]+)?)\s*%\s*phi\s+co\s+dinh/i,
  ];

  for (const pattern of candidates) {
    const match = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(pattern);
    if (match?.[1]) {
      return Number(match[1].replace(",", "."));
    }
  }

  return null;
}
