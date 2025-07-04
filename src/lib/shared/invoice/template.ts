export type { SharedInvoiceData } from './types';
import type { SharedInvoiceData } from './types';
import { getInvoiceStyles } from './styles';
import { buildInvoiceHTML } from './htmlBuilder';

export const generateInvoiceHTML = (data: SharedInvoiceData): string => {
  console.log('Generating unified HTML template for invoice:', data.invoice.transactionId);
  
  const styles = getInvoiceStyles();
  const html = buildInvoiceHTML(data, styles);
  
  return html;
};