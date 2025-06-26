
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
    // Create a clean PDF with structured invoice data
    const pdfContent = createCleanInvoicePDF(sharedData, subtotal, total);
    
    // Convert to base64 for email attachment
    const base64PDF = btoa(pdfContent);
    console.log('Generated clean PDF for email attachment');
    
    return base64PDF;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

// Create a clean, structured PDF with proper invoice formatting
function createCleanInvoicePDF(data: SharedInvoiceData, subtotal: number, total: number): string {
  // Format dates properly
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Create clean invoice content
  const invoiceContent = `
INVOICE

Invoice ID: ${data.invoice.transactionId}
Invoice Date: ${formatDate(data.invoiceDate)}
Due Date: ${formatDate(data.dueDate)}
${data.purchaseOrder ? `Purchase Order: ${data.purchaseOrder}` : ''}
${data.paymentTerms ? `Payment Terms: ${data.paymentTerms}` : ''}

BILLED TO:
${data.billedTo.name}
${data.billedTo.address.replace(/\n/g, ' ')}

PAY TO:
${data.payTo.name}
${data.payTo.address.replace(/\n/g, ' ')}

CURRENCY: ${data.currency}

LINE ITEMS:
${data.lineItems.map(item => 
  `${item.description} - Qty: ${item.quantity} - Amount: ${(item.quantity * item.amount).toFixed(2)}`
).join('\n')}

SUBTOTAL: ${subtotal.toFixed(2)} ${data.currency}
${data.tax > 0 ? `TAX: ${data.tax.toFixed(2)} ${data.currency}` : ''}
TOTAL: ${total.toFixed(2)} ${data.currency}
  `.trim();

  // Create PDF structure with clean content
  const pdfHeader = '%PDF-1.4\n';
  const catalog = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const pages = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  
  // Convert content to PDF text commands
  const lines = invoiceContent.split('\n');
  let yPosition = 750;
  const pageContent = lines.map(line => {
    if (line.trim() === '') {
      yPosition -= 15;
      return '';
    }
    
    const fontSize = line.match(/^(INVOICE|BILLED TO:|PAY TO:|LINE ITEMS:|TOTAL:)/) ? 14 : 
                    line.match(/^(Invoice ID:|Currency:|SUBTOTAL:|TAX:)/) ? 12 : 10;
    
    const result = `/${fontSize === 14 ? 'F2' : fontSize === 12 ? 'F1' : 'F1'} ${fontSize} Tf\n50 ${yPosition} Td\n(${line.replace(/[()\\]/g, '')}) Tj\n`;
    yPosition -= fontSize + 5;
    return result;
  }).join('0 -20 Td\n');

  const fullPageContent = `BT\n/F1 12 Tf\n${pageContent}ET`;
  
  const page = `3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> >>
endobj
`;
  
  const content = `4 0 obj
<< /Length ${fullPageContent.length} >>
stream
${fullPageContent}
endstream
endobj
`;
  
  const xref = `xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000400 00000 n 
`;
  
  const trailer = `trailer
<< /Size 5 /Root 1 0 R >>
startxref
${(pdfHeader + catalog + pages + page + content).length}
%%EOF`;
  
  return pdfHeader + catalog + pages + page + content + xref + trailer;
}
