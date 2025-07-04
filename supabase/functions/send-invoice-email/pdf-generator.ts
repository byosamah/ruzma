
import { generateInvoiceHTML, SharedInvoiceData } from '../../../src/lib/shared/invoice/template.ts';
import type { InvoiceData, ProfileData, BrandingData, ParsedInvoiceData, LineItem } from './types.ts';

export async function generateInvoicePDF(
  invoice: InvoiceData,
  profile: ProfileData | null,
  branding: BrandingData | null,
  originalData: ParsedInvoiceData,
  lineItems: LineItem[],
  subtotal: number,
  total: number,
  currency: string,
  clientName?: string
): Promise<{ pdfBuffer: Uint8Array; filename: string }> {
  console.log('Generating invoice PDF');
  
  const invoiceDate = new Date(invoice.date);
  const dueDate = originalData?.dueDate ? new Date(originalData.dueDate) : new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Convert to shared data format
  const sharedData: SharedInvoiceData = {
    invoice: {
      id: invoice.id,
      transactionId: invoice.transaction_id,
      amount: invoice.amount,
      date: invoiceDate,
      projectName: invoice.project_name
    },
    billedTo: {
      name: originalData?.billedTo?.name || clientName || 'Client',
      address: originalData?.billedTo?.address || 'Client Address\nCity, State, ZIP'
    },
    payTo: {
      name: originalData?.payTo?.name || branding?.freelancer_name || profile?.full_name || 'Your Business',
      address: originalData?.payTo?.address || 'Your Business Address\nCity, State, ZIP'
    },
    lineItems: lineItems,
    currency: currency,
    logoUrl: originalData?.logoUrl || branding?.logo_url,
    purchaseOrder: originalData?.purchaseOrder || '',
    paymentTerms: originalData?.paymentTerms || '',
    tax: originalData?.tax || 0,
    invoiceDate: invoiceDate,
    dueDate: dueDate
  };

  try {
    // Generate HTML content
    const htmlContent = generateInvoiceHTML(sharedData);
    console.log('Generated HTML content for PDF conversion');

    // Create a simple PDF using basic PDF structure
    const pdfContent = await createPDFFromHTML(htmlContent, sharedData);
    const filename = `Invoice-${invoice.transaction_id}.pdf`;
    
    console.log('Generated PDF buffer successfully');
    
    return {
      pdfBuffer: pdfContent,
      filename: filename
    };
    
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw new Error(`Failed to generate PDF invoice: ${error.message}`);
  }
}

async function createPDFFromHTML(htmlContent: string, data: SharedInvoiceData): Promise<Uint8Array> {
  // Simple PDF generation using basic PDF structure
  const pdfHeader = '%PDF-1.4\n';
  
  // Calculate totals
  const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
  const total = subtotal + (data.tax || 0);
  
  // Create PDF content stream with invoice data
  const contentStream = `
BT
/F1 24 Tf
50 750 Td
(INVOICE) Tj
0 -30 Td
/F1 12 Tf
(Invoice ID: ${data.invoice.transactionId}) Tj
0 -20 Td
(Date: ${data.invoiceDate.toLocaleDateString()}) Tj
0 -20 Td
(Due Date: ${data.dueDate.toLocaleDateString()}) Tj
0 -40 Td
/F1 14 Tf
(Bill To:) Tj
0 -20 Td
/F1 12 Tf
(${data.billedTo.name}) Tj
0 -15 Td
(${data.billedTo.address.replace(/\n/g, ') Tj 0 -15 Td (')}) Tj
0 -40 Td
/F1 14 Tf
(From:) Tj
0 -20 Td
/F1 12 Tf
(${data.payTo.name}) Tj
0 -15 Td
(${data.payTo.address.replace(/\n/g, ') Tj 0 -15 Td (')}) Tj
0 -40 Td
/F1 14 Tf
(Items:) Tj
0 -25 Td
/F1 12 Tf
${data.lineItems.map(item => `(${item.description} - Qty: ${item.quantity} - Amount: ${(item.quantity * item.amount).toFixed(2)} ${data.currency}) Tj 0 -20 Td`).join('\n')}
0 -20 Td
/F1 14 Tf
(Subtotal: ${subtotal.toFixed(2)} ${data.currency}) Tj
${data.tax > 0 ? `0 -20 Td (Tax: ${data.tax.toFixed(2)} ${data.currency}) Tj` : ''}
0 -20 Td
/F1 16 Tf
(Total: ${total.toFixed(2)} ${data.currency}) Tj
ET
`;

  const contentLength = contentStream.length;

  // Build PDF structure
  const catalog = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n\n`;
  const pages = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n\n`;
  const page = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n\n`;
  const content = `4 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream\nendobj\n\n`;

  // Calculate positions for xref table
  const catalogPos = pdfHeader.length;
  const pagesPos = catalogPos + catalog.length;
  const pagePos = pagesPos + pages.length;
  const contentPos = pagePos + page.length;
  const xrefPos = contentPos + content.length;

  const xref = `xref\n0 5\n0000000000 65535 f \n${catalogPos.toString().padStart(10, '0')} 00000 n \n${pagesPos.toString().padStart(10, '0')} 00000 n \n${pagePos.toString().padStart(10, '0')} 00000 n \n${contentPos.toString().padStart(10, '0')} 00000 n \n`;
  const trailer = `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  const fullPdf = pdfHeader + catalog + pages + page + content + xref + trailer;
  
  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  return encoder.encode(fullPdf);
}
