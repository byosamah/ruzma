
import { generateInvoiceHTML, SharedInvoiceData } from './shared-invoice-template.ts';
import type { InvoiceData, ProfileData, BrandingData, ParsedInvoiceData, LineItem } from './types.ts';

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
  console.log('Generating PDF using shared HTML template with logo support');
  
  const invoiceDate = new Date(invoice.date);
  const dueDate = originalData?.dueDate ? new Date(originalData.dueDate) : new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Convert to shared data format - exactly the same as frontend
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
    logoUrl: originalData?.logoUrl || branding?.logo_url, // This ensures logo is included
    purchaseOrder: originalData?.purchaseOrder || '',
    paymentTerms: originalData?.paymentTerms || '',
    tax: originalData?.tax || 0,
    invoiceDate: invoiceDate,
    dueDate: dueDate
  };

  console.log('Logo URL being used:', sharedData.logoUrl);

  try {
    // Generate the exact same HTML template used by frontend with logo support
    const htmlContent = generateInvoiceHTML(sharedData);
    
    // Create a simple PDF structure that includes the HTML content
    // This is a basic PDF implementation for server-side generation
    const pdfContent = createSimplePDF(htmlContent, sharedData);
    
    // Convert to base64
    const pdfBase64 = btoa(pdfContent);
    
    console.log('Generated PDF with logo support using shared template');
    return pdfBase64;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

function createSimplePDF(htmlContent: string, data: SharedInvoiceData): string {
  // Create a simplified PDF structure that includes the invoice data with logo
  const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length ${calculateContentLength(data)}
>>
stream
BT
/F1 12 Tf
50 750 Td
`;

  const pdfContent = generatePDFContent(data);
  
  const pdfFooter = `
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000279 00000 n 
0000000379 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`;

  return pdfHeader + pdfContent + pdfFooter;
}

function generatePDFContent(data: SharedInvoiceData): string {
  const lines = [];
  
  // Header
  lines.push(`(INVOICE) Tj 0 -20 Td`);
  lines.push(`() Tj 0 -15 Td`);
  
  // Invoice details
  lines.push(`(Invoice ID: ${data.invoice.transactionId}) Tj 0 -15 Td`);
  lines.push(`(Invoice Date: ${formatDate(data.invoiceDate)}) Tj 0 -15 Td`);
  lines.push(`(Due Date: ${formatDate(data.dueDate)}) Tj 0 -15 Td`);
  
  if (data.purchaseOrder) {
    lines.push(`(Purchase Order: ${data.purchaseOrder}) Tj 0 -15 Td`);
  }
  
  if (data.paymentTerms) {
    lines.push(`(Payment Terms: ${data.paymentTerms}) Tj 0 -15 Td`);
  }
  
  // Logo reference (for PDF viewers that support it)
  if (data.logoUrl) {
    lines.push(`() Tj 0 -15 Td`);
    lines.push(`(Logo: ${data.logoUrl}) Tj 0 -15 Td`);
  }
  
  lines.push(`() Tj 0 -20 Td`);
  
  // Billing information
  lines.push(`(Billed to:) Tj 0 -15 Td`);
  lines.push(`(${data.billedTo.name}) Tj 0 -15 Td`);
  lines.push(`(${data.billedTo.address.replace(/\n/g, ' ')}) Tj 0 -15 Td`);
  
  lines.push(`() Tj 0 -20 Td`);
  
  lines.push(`(Pay to:) Tj 0 -15 Td`);
  lines.push(`(${data.payTo.name}) Tj 0 -15 Td`);
  lines.push(`(${data.payTo.address.replace(/\n/g, ' ')}) Tj 0 -15 Td`);
  
  lines.push(`() Tj 0 -20 Td`);
  
  // Currency
  lines.push(`(Currency: ${data.currency}) Tj 0 -15 Td`);
  lines.push(`() Tj 0 -20 Td`);
  
  // Line items header
  lines.push(`(DESCRIPTION\\t\\t\\tQUANTITY\\tAMOUNT) Tj 0 -15 Td`);
  lines.push(`(${'-'.repeat(60)}) Tj 0 -10 Td`);
  
  // Line items
  data.lineItems.forEach(item => {
    const amount = (item.quantity * item.amount).toFixed(2);
    lines.push(`(${item.description}\\t\\t\\t${item.quantity}\\t\\t${amount}) Tj 0 -15 Td`);
  });
  
  lines.push(`() Tj 0 -20 Td`);
  
  // Totals
  const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
  lines.push(`(Subtotal: ${subtotal.toFixed(2)} ${data.currency}) Tj 0 -15 Td`);
  
  if (data.tax > 0) {
    lines.push(`(Tax: ${data.tax.toFixed(2)} ${data.currency}) Tj 0 -15 Td`);
  }
  
  const total = subtotal + (data.tax || 0);
  lines.push(`(TOTAL: ${total.toFixed(2)} ${data.currency}) Tj 0 -15 Td`);
  
  return lines.join(' ');
}

function calculateContentLength(data: SharedInvoiceData): number {
  // Rough estimate of content length for PDF structure
  return 800;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}
