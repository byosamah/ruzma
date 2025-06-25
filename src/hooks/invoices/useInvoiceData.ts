
import { useInvoiceContext } from '@/contexts/InvoiceContext';

export const useInvoiceData = () => {
  const { invoices, generateTransactionId } = useInvoiceContext();

  return {
    invoices,
    setInvoices: () => {}, // This is handled by the context now
    generateTransactionId
  };
};
