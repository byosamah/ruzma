export type { SharedInvoiceData } from './shared-types.ts';
import type { SharedInvoiceData } from './shared-types.ts';
import { getInvoiceStyles } from './shared-styles.ts';
import { buildInvoiceHTML } from './shared-html-builder.ts';

export const generateInvoiceHTML = (data: SharedInvoiceData): string => {
  console.log('Generating unified HTML template for invoice:', data.invoice.transactionId);
  
  const styles = getInvoiceStyles();
  const html = buildInvoiceHTML(data, styles);
  
  return html;
};