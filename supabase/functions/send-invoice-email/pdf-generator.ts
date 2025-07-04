
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
): Promise<{ htmlContent: string; base64Html: string }> {
  console.log('Generating invoice HTML for email and attachment');
  
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
    // Generate clean HTML content for email body and attachment
    const htmlContent = generateInvoiceHTML(sharedData);
    
    console.log('Generated HTML content for invoice');
    
    // Create proper HTML file content with enhanced styling for standalone viewing
    const standaloneHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.transaction_id}</title>
    <style>
        @media print {
            @page { size: A4; margin: 1cm; }
            body { -webkit-print-color-adjust: exact; }
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0; 
            padding: 20px; 
            background: #ffffff;
            color: #000000;
        }
        .print-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
        }
        .print-btn:hover { background: #0056b3; }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">Print Invoice</button>
    ${htmlContent.replace(/<html[^>]*>|<\/html>|<head[^>]*>.*?<\/head>|<body[^>]*>|<\/body>/gs, '')}
    <script>
        // Auto-focus for better user experience
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Invoice loaded successfully');
        });
    </script>
</body>
</html>`;
    
    // Convert to base64 for attachment
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(standaloneHtmlContent);
    const base64Html = btoa(String.fromCharCode(...htmlBytes));
    
    console.log('Generated standalone HTML invoice for attachment');
    
    return {
      htmlContent: htmlContent,
      base64Html: base64Html
    };
    
  } catch (error) {
    console.error('Error generating invoice HTML:', error);
    throw new Error(`Failed to generate invoice: ${error.message}`);
  }
}
