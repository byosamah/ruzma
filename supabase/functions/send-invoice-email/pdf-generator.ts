
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
    
    // Convert HTML to PDF using a simple but effective approach
    // Since we can't use html2canvas in Deno, we'll create a clean PDF structure
    // that matches the visual layout of the HTML
    const pdfContent = createPDFFromTemplate(sharedData, htmlContent);
    
    console.log('Generated PDF using shared template approach');
    return pdfContent;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

function createPDFFromTemplate(data: SharedInvoiceData, htmlContent: string): string {
  // Create a proper PDF that visually matches the HTML template
  const pdfHeader = '%PDF-1.4\n';
  
  // Calculate subtotal and total
  const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
  const tax = data.tax || 0;
  const total = subtotal + tax;
  
  // Create the content stream with proper formatting
  const contentStream = generatePDFContent(data, subtotal, total);
  const contentLength = contentStream.length;

  // PDF structure
  const catalog = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n\n`;
  
  const pages = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n\n`;
  
  const page = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> >>\nendobj\n\n`;
  
  const content = `4 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream\nendobj\n\n`;

  // Calculate positions for xref table
  const catalogPos = pdfHeader.length;
  const pagesPos = catalogPos + catalog.length;
  const pagePos = pagesPos + pages.length;
  const contentPos = pagePos + page.length;
  const xrefPos = contentPos + content.length;

  const xref = `xref\n0 5\n0000000000 65535 f \n${catalogPos.toString().padStart(10, '0')} 00000 n \n${pagesPos.toString().padStart(10, '0')} 00000 n \n${pagePos.toString().padStart(10, '0')} 00000 n \n${contentPos.toString().padStart(10, '0')} 00000 n \n`;

  const trailer = `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  const fullPDF = pdfHeader + catalog + pages + page + content + xref + trailer;
  
  // Convert to base64
  return btoa(fullPDF);
}

function generatePDFContent(data: SharedInvoiceData, subtotal: number, total: number): string {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Create PDF drawing commands that match the HTML layout
  const commands = [
    'BT', // Begin text
    
    // Invoice Title (large, bold)
    '/F2 24 Tf',
    '50 750 Td',
    '(Invoice) Tj',
    
    // Invoice details section
    '/F1 10 Tf',
    '0 -40 Td',
    `(Invoice ID: ${data.invoice.transactionId}) Tj`,
    '0 -15 Td',
    `(Invoice Date: ${formatDate(data.invoiceDate)}) Tj`,
    '0 -15 Td',
    `(Due date: ${formatDate(data.dueDate)}) Tj`,
  ];

  // Add purchase order and payment terms if they exist
  if (data.purchaseOrder) {
    commands.push('0 -15 Td', `(Purchase Order: ${data.purchaseOrder}) Tj`);
  }
  if (data.paymentTerms) {
    commands.push('0 -15 Td', `(Payment Terms: ${data.paymentTerms}) Tj`);
  }

  // Billing information
  commands.push(
    '0 -30 Td',
    '/F2 12 Tf',
    '(Billed to:) Tj',
    '/F1 10 Tf',
    '0 -15 Td',
    `(${data.billedTo.name}) Tj`
  );

  // Add billing address lines
  const billingAddressLines = data.billedTo.address.split('\n');
  billingAddressLines.forEach(line => {
    commands.push('0 -12 Td', `(${line}) Tj`);
  });

  // Pay to section (positioned to the right - simulate two columns)
  commands.push(
    '300 60 Td', // Move to right column, up to align with "Billed to"
    '/F2 12 Tf',
    '(Pay to:) Tj',
    '/F1 10 Tf',
    '0 -15 Td',
    `(${data.payTo.name}) Tj`
  );

  // Add pay-to address lines
  const payToAddressLines = data.payTo.address.split('\n');
  payToAddressLines.forEach(line => {
    commands.push('0 -12 Td', `(${line}) Tj`);
  });

  // Currency section
  commands.push(
    '-300 -40 Td', // Move back to left, down
    '/F1 10 Tf',
    `(CURRENCY: ${data.currency}) Tj`
  );

  // Line items table header
  commands.push(
    '0 -30 Td',
    '/F2 10 Tf',
    '(DESCRIPTION) Tj',
    '300 0 Td',
    '(QUANTITY) Tj',
    '100 0 Td',
    '(AMOUNT) Tj'
  );

  // Line items
  commands.push('-400 -20 Td', '/F1 10 Tf');
  data.lineItems.forEach(item => {
    const itemTotal = (item.quantity * item.amount).toFixed(2);
    commands.push(
      `(${item.description}) Tj`,
      '300 0 Td',
      `(${item.quantity}) Tj`,
      '100 0 Td',
      `(${itemTotal}) Tj`,
      '-400 -15 Td'
    );
  });

  // Totals section
  commands.push(
    '300 -20 Td',
    '/F1 10 Tf',
    `(SUBTOTAL: ${subtotal.toFixed(2)} ${data.currency}) Tj`
  );

  if (data.tax > 0) {
    commands.push(
      '0 -15 Td',
      `(TAX: ${data.tax.toFixed(2)} ${data.currency}) Tj`
    );
  }

  commands.push(
    '0 -15 Td',
    '/F2 12 Tf',
    `(TOTAL: ${total.toFixed(2)} ${data.currency}) Tj`
  );

  commands.push('ET'); // End text

  return commands.join('\n');
}
