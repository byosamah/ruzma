
import { calculatePDFPositions } from './pdf-utils.ts';

export function buildPDFStructure(contentStream: string): string {
  const pdfHeader = '%PDF-1.4\n';
  const contentLength = contentStream.length;

  // PDF structure
  const catalog = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n\n`;
  
  const pages = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n\n`;
  
  const page = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> >>\nendobj\n\n`;
  
  const content = `4 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream\nendobj\n\n`;

  // Calculate positions for xref table
  const { catalogPos, pagesPos, pagePos, contentPos, xrefPos } = calculatePDFPositions(
    catalog.length,
    pages.length,
    page.length,
    content.length
  );

  const xref = `xref\n0 5\n0000000000 65535 f \n${catalogPos.toString().padStart(10, '0')} 00000 n \n${pagesPos.toString().padStart(10, '0')} 00000 n \n${pagePos.toString().padStart(10, '0')} 00000 n \n${contentPos.toString().padStart(10, '0')} 00000 n \n`;

  const trailer = `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return pdfHeader + catalog + pages + page + content + xref + trailer;
}
