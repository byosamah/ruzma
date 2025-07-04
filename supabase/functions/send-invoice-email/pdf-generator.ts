
import { generateInvoiceHTML, SharedInvoiceData } from './shared-invoice-template.ts';
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
): Promise<string> {
  console.log('Generating PDF using simple HTML-to-PDF conversion');
  
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
    logoUrl: originalData?.logoUrl || branding?.logo_url,
    purchaseOrder: originalData?.purchaseOrder || '',
    paymentTerms: originalData?.paymentTerms || '',
    tax: originalData?.tax || 0,
    invoiceDate: invoiceDate,
    dueDate: dueDate
  };

  try {
    // Generate HTML with proper Arabic support
    const htmlContent = generateInvoiceHTML(sharedData);
    
    console.log('Generated HTML content for PDF conversion');
    
    // For now, we'll create a simple base64 encoded HTML file as PDF
    // This is a temporary solution until we can implement proper PDF generation
    // that works reliably in the Supabase edge function environment
    
    // Create a simple PDF-like structure using HTML
    const pdfLikeContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.transaction_id}</title>
  <style>
    @page { size: A4; margin: 1cm; }
    body { font-family: Arial, sans-serif, 'Noto Sans Arabic'; margin: 0; padding: 20px; }
    .print-only { display: block; }
    @media screen { .print-only { display: none; } }
  </style>
</head>
<body>
  ${htmlContent.replace(/<html[^>]*>|<\/html>|<head[^>]*>.*?<\/head>|<body[^>]*>|<\/body>/gs, '')}
</body>
</html>`;
    
    // Convert HTML to base64 - this will work as an HTML attachment that can be viewed/printed as PDF
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(pdfLikeContent);
    const base64Html = btoa(String.fromCharCode(...htmlBytes));
    
    console.log('Generated HTML-based PDF alternative');
    return base64Html;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}
