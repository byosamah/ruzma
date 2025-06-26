
import jsPDFLib from 'npm:jspdf@2.5.1';
import type { InvoiceData, ProfileData, BrandingData, ParsedInvoiceData, LineItem } from './types.ts';

// Fix jsPDF import for Deno environment
const jsPDF = jsPDFLib.default || jsPDFLib.jsPDF || jsPDFLib;

export function generateInvoicePDF(
  invoice: InvoiceData,
  profile: ProfileData | null,
  branding: BrandingData | null,
  originalData: ParsedInvoiceData,
  lineItems: LineItem[],
  subtotal: number,
  total: number,
  currency: string,
  clientName?: string
): string {
  const invoiceDate = new Date(invoice.date);
  const dueDate = originalData?.dueDate ? new Date(originalData.dueDate) : new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const tax = originalData?.tax || 0;

  console.log('Creating PDF with jsPDF constructor');
  const pdf = new jsPDF();
  
  // Add content to PDF
  pdf.setFontSize(24);
  pdf.text('Invoice', 20, 30);
  
  pdf.setFontSize(12);
  pdf.text(`Invoice ID: ${invoice.transaction_id}`, 20, 50);
  pdf.text(`Date: ${invoiceDate.toLocaleDateString()}`, 20, 60);
  pdf.text(`Due Date: ${dueDate.toLocaleDateString()}`, 20, 70);
  
  pdf.text('Billed to:', 20, 90);
  pdf.text(originalData?.billedTo?.name || clientName || 'Client', 20, 100);
  
  pdf.text('From:', 120, 90);
  pdf.text(originalData?.payTo?.name || branding?.freelancer_name || profile?.full_name || 'Your Business', 120, 100);
  
  // Line items
  let yPos = 130;
  pdf.text('Description', 20, yPos);
  pdf.text('Qty', 120, yPos);
  pdf.text('Amount', 160, yPos);
  
  yPos += 10;
  lineItems.forEach((item: LineItem) => {
    pdf.text(item.description, 20, yPos);
    pdf.text(item.quantity.toString(), 120, yPos);
    pdf.text(`${(item.quantity * item.amount).toFixed(2)} ${currency}`, 160, yPos);
    yPos += 10;
  });
  
  // Totals
  yPos += 10;
  pdf.text(`Subtotal: ${subtotal.toFixed(2)} ${currency}`, 120, yPos);
  if (tax > 0) {
    yPos += 10;
    pdf.text(`Tax: ${tax.toFixed(2)} ${currency}`, 120, yPos);
  }
  yPos += 10;
  pdf.setFontSize(14);
  pdf.text(`Total: ${total.toFixed(2)} ${currency}`, 120, yPos);

  // Generate PDF buffer
  console.log('Generating PDF buffer');
  const pdfBuffer = pdf.output('arraybuffer');
  return btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
}
