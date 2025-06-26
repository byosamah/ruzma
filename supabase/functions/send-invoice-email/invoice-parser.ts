
import type { InvoiceData, ParsedInvoiceData, LineItem } from './types.ts';

export function parseInvoiceData(invoice: InvoiceData): ParsedInvoiceData {
  let originalData = null;
  
  if (invoice.invoice_data) {
    try {
      if (typeof invoice.invoice_data === 'string') {
        originalData = JSON.parse(invoice.invoice_data);
      } else if (typeof invoice.invoice_data === 'object') {
        originalData = invoice.invoice_data;
      }
    } catch (error) {
      console.error('Error parsing invoice data:', error);
    }
  }

  return originalData || {};
}

export function generateLineItems(invoice: InvoiceData, originalData: ParsedInvoiceData): LineItem[] {
  if (originalData?.lineItems && Array.isArray(originalData.lineItems) && originalData.lineItems.length > 0) {
    return originalData.lineItems;
  }

  return [{
    description: `Project: ${invoice.project_name}`,
    quantity: 1,
    amount: Number(invoice.amount)
  }];
}

export function calculateTotals(lineItems: LineItem[], tax: number = 0) {
  const subtotal = lineItems.reduce((sum: number, item: LineItem) => sum + (item.quantity * item.amount), 0);
  const total = subtotal + tax;
  
  return { subtotal, total };
}
