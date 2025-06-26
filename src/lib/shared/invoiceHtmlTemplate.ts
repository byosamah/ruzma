
export type { SharedInvoiceData } from './types';
import type { SharedInvoiceData } from './types';
import { calculateInvoiceTotals } from './invoiceUtils';
import { getInvoiceStyles } from './invoiceStyles';
import { buildInvoiceHTML } from './invoiceHtmlBuilder';

export const generateInvoiceHTML = (data: SharedInvoiceData): string => {
  console.log('Generating shared HTML template for invoice:', data.invoice.transactionId);
  
  const { subtotal, total } = calculateInvoiceTotals(data.lineItems, data.tax);
  const styles = getInvoiceStyles();
  const html = buildInvoiceHTML(data, styles, subtotal, total);
  
  return html;
};
