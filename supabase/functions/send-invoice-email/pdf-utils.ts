
export function calculatePDFPositions(catalogLength: number, pagesLength: number, pageLength: number, contentLength: number) {
  const catalogPos = '%PDF-1.4\n'.length;
  const pagesPos = catalogPos + catalogLength;
  const pagePos = pagesPos + pagesLength;
  const contentPos = pagePos + pageLength;
  const xrefPos = contentPos + contentLength;

  return { catalogPos, pagesPos, pagePos, contentPos, xrefPos };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

export function convertToBase64(pdfContent: string): string {
  return btoa(pdfContent);
}
