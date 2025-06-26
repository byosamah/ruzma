
export type { SharedInvoiceData } from './shared-invoice-types.ts';
import type { SharedInvoiceData } from './shared-invoice-types.ts';
import { getInvoiceStyles } from './invoice-template-styles.ts';
import { buildInvoiceHTML } from './invoice-html-builder.ts';

export const generateInvoiceHTML = (data: SharedInvoiceData): string => {
  console.log('Generating shared HTML template for invoice:', data.invoice.transactionId);
  
  const styles = getInvoiceStyles();
  const html = buildInvoiceHTML(data, styles);
  
  return html;
};
