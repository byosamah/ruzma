
import { generateInvoiceHTML, SharedInvoiceData } from './shared-invoice-template.ts';
import { generatePDFContent } from './pdf-content-generator.ts';
import { buildPDFStructure } from './pdf-structure-builder.ts';
import { convertToBase64 } from './pdf-utils.ts';
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
    // Generate the exact same HTML template used by frontend
    const htmlContent = generateInvoiceHTML(sharedData);
    
    // Calculate subtotal and total
    const calculatedSubtotal = sharedData.lineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
    const tax = sharedData.tax || 0;
    const calculatedTotal = calculatedSubtotal + tax;
    
    // Create the content stream with proper formatting
    const contentStream = generatePDFContent(sharedData, calculatedSubtotal, calculatedTotal);
    
    // Build the complete PDF structure
    const fullPDF = buildPDFStructure(contentStream);
    
    // Convert to base64
    const pdfBase64 = convertToBase64(fullPDF);
    
    console.log('Generated PDF using shared template approach');
    return pdfBase64;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}
