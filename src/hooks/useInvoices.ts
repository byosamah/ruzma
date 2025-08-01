
import { useInvoiceManager } from './useInvoiceManager';

// Re-export types for backward compatibility
export type { InvoiceStatus, Invoice } from './invoices/types';

export const useInvoices = () => {
  return useInvoiceManager();
};
