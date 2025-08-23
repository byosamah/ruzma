
import { useInvoiceManager } from '@/hooks/useInvoiceManager';
import { InvoiceFormData } from '../types';

export const useInvoiceCalculations = (
  invoiceData: InvoiceFormData,
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceFormData>>
) => {
  const { updateLineItem, addLineItem, removeLineItem, updateTax } = useInvoiceManager();

  return {
    updateLineItem: (id: string, field: keyof import('../types').LineItem, value: string | number) => updateLineItem(invoiceData, setInvoiceData, id, field, value),
    addLineItem: () => addLineItem(invoiceData, setInvoiceData),
    removeLineItem: (id: string) => removeLineItem(invoiceData, setInvoiceData, id),
    updateTax: (taxAmount: number) => updateTax(invoiceData, setInvoiceData, taxAmount)
  };
};
