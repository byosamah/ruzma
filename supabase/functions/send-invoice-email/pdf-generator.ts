
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

  // Generate HTML using shared template
  const html = generateInvoiceHTML(sharedData);
  console.log('Generated shared HTML template for PDF conversion');

  try {
    // For now, we'll use a simple HTML-to-PDF conversion
    // In a production environment, you might want to use Puppeteer or similar
    // But since we're in a Deno environment, we'll create a basic PDF from HTML
    
    // This is a simplified approach - in practice you'd want to use a proper HTML-to-PDF converter
    // For demonstration, we'll encode the HTML and return it as base64
    // The actual PDF generation would require a proper HTML-to-PDF library
    
    console.log('Converting HTML to PDF buffer (simplified approach)');
    
    // Create a basic PDF structure with the HTML content
    // This is a placeholder - in production you'd use a proper PDF library
    const htmlBuffer = new TextEncoder().encode(html);
    return btoa(String.fromCharCode(...htmlBuffer));
    
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}
