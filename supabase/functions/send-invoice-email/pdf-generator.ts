
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
  console.log('Generating PDF using shared HTML template');
  
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
    // Generate the same HTML template used by frontend
    const htmlContent = generateInvoiceHTML(sharedData);
    
    // Create a comprehensive PDF with all invoice data
    const pdfContent = createComprehensivePDF(sharedData, subtotal, total, htmlContent);
    
    // Convert to base64 for email attachment
    const base64PDF = btoa(pdfContent);
    console.log('Generated comprehensive PDF for email attachment');
    
    return base64PDF;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

// Create a comprehensive PDF with all invoice data structured properly
function createComprehensivePDF(data: SharedInvoiceData, subtotal: number, total: number, htmlContent: string): string {
  // Format dates properly
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Extract content structure from HTML to create proper PDF content
  const invoiceContent = generateInvoiceText(data, subtotal, total, formatDate);

  // Create proper PDF structure
  const pdfHeader = '%PDF-1.4\n';
  
  // PDF objects
  const catalog = `1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
`;

  const pages = `2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
`;

  // Create comprehensive page content with proper formatting
  const textCommands = createTextCommands(invoiceContent);
  const contentLength = textCommands.length;

  const page = `3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> >>
endobj
`;

  const content = `4 0 obj
<< /Length ${contentLength} >>
stream
${textCommands}
endstream
endobj
`;

  // Calculate positions for xref table
  const catalogPos = pdfHeader.length;
  const pagesPos = catalogPos + catalog.length;
  const pagePos = pagesPos + pages.length;
  const contentPos = pagePos + page.length;
  const xrefPos = contentPos + content.length;

  const xref = `xref
0 5
0000000000 65535 f 
${catalogPos.toString().padStart(10, '0')} 00000 n 
${pagesPos.toString().padStart(10, '0')} 00000 n 
${pagePos.toString().padStart(10, '0')} 00000 n 
${contentPos.toString().padStart(10, '0')} 00000 n 
`;

  const trailer = `trailer
<< /Size 5 /Root 1 0 R >>
startxref
${xrefPos}
%%EOF`;

  return pdfHeader + catalog + pages + page + content + xref + trailer;
}

function generateInvoiceText(data: SharedInvoiceData, subtotal: number, total: number, formatDate: (date: Date) => string): string[] {
  const lines = [];
  
  // Header
  lines.push('INVOICE');
  lines.push('');
  
  // Invoice details
  lines.push(`Invoice ID: ${data.invoice.transactionId}`);
  lines.push(`Invoice Date: ${formatDate(data.invoiceDate)}`);
  lines.push(`Due Date: ${formatDate(data.dueDate)}`);
  
  if (data.purchaseOrder) {
    lines.push(`Purchase Order: ${data.purchaseOrder}`);
  }
  if (data.paymentTerms) {
    lines.push(`Payment Terms: ${data.paymentTerms}`);
  }
  
  lines.push('');
  
  // Billing information
  lines.push('BILLED TO:');
  lines.push(data.billedTo.name);
  const billedToAddress = data.billedTo.address.split('\n');
  billedToAddress.forEach(line => lines.push(line));
  lines.push('');
  
  lines.push('PAY TO:');
  lines.push(data.payTo.name);
  const payToAddress = data.payTo.address.split('\n');
  payToAddress.forEach(line => lines.push(line));
  lines.push('');
  
  // Currency
  lines.push(`CURRENCY: ${data.currency}`);
  lines.push('');
  
  // Line items
  lines.push('LINE ITEMS:');
  lines.push('DESCRIPTION                    QTY    AMOUNT');
  lines.push('----------------------------------------');
  
  data.lineItems.forEach(item => {
    const description = item.description.length > 25 ? item.description.substring(0, 25) + '...' : item.description;
    const qty = item.quantity.toString();
    const amount = (item.quantity * item.amount).toFixed(2);
    lines.push(`${description.padEnd(30)} ${qty.padStart(3)} ${amount.padStart(8)}`);
  });
  
  lines.push('');
  
  // Totals
  lines.push(`SUBTOTAL: ${subtotal.toFixed(2)} ${data.currency}`);
  if (data.tax > 0) {
    lines.push(`TAX: ${data.tax.toFixed(2)} ${data.currency}`);
  }
  lines.push(`TOTAL: ${total.toFixed(2)} ${data.currency}`);
  
  return lines;
}

function createTextCommands(lines: string[]): string {
  let yPosition = 750;
  const commands = ['BT'];
  
  lines.forEach((line, index) => {
    if (line === '') {
      yPosition -= 15;
      return;
    }
    
    // Determine font and size based on content
    let font = 'F1';
    let size = 10;
    
    if (line === 'INVOICE') {
      font = 'F2';
      size = 18;
    } else if (line.includes('BILLED TO:') || line.includes('PAY TO:') || line.includes('LINE ITEMS:') || line.includes('TOTAL:')) {
      font = 'F2';
      size = 12;
    } else if (line.includes('Invoice ID:') || line.includes('CURRENCY:') || line.includes('SUBTOTAL:')) {
      size = 11;
    }
    
    commands.push(`/${font} ${size} Tf`);
    commands.push(`50 ${yPosition} Td`);
    commands.push(`(${line.replace(/[()\\]/g, '')}) Tj`);
    commands.push('0 -' + (size + 3) + ' Td');
    
    yPosition -= (size + 3);
  });
  
  commands.push('ET');
  return commands.join('\n');
}
