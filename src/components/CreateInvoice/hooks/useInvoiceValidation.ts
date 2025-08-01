
import { useInvoiceManager } from '@/hooks/useInvoiceManager';
import { InvoiceFormData } from '../types';

export const useInvoiceValidation = (invoiceData: InvoiceFormData) => {
  const { handleSendInvoice, isLoading } = useInvoiceManager();

  const handleSend = () => handleSendInvoice(invoiceData);

  return {
    handleSend,
    isLoading
  };
};
