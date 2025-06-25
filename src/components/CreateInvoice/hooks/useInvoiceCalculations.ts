
import { InvoiceFormData, LineItem } from '../types';

export const useInvoiceCalculations = (
  invoiceData: InvoiceFormData,
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceFormData>>
) => {
  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setInvoiceData(prev => {
      const updatedItems = prev.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      );
      
      // Calculate totals immediately
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
      const total = subtotal + prev.tax;
      
      return {
        ...prev,
        lineItems: updatedItems,
        subtotal,
        total
      };
    });
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      amount: 0
    };
    setInvoiceData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  const removeLineItem = (id: string) => {
    setInvoiceData(prev => {
      const updatedItems = prev.lineItems.filter(item => item.id !== id);
      
      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
      const total = subtotal + prev.tax;
      
      return {
        ...prev,
        lineItems: updatedItems,
        subtotal,
        total
      };
    });
  };

  const updateTax = (taxAmount: number) => {
    setInvoiceData(prev => ({
      ...prev,
      tax: taxAmount,
      total: prev.subtotal + taxAmount
    }));
  };

  return {
    updateLineItem,
    addLineItem,
    removeLineItem,
    updateTax
  };
};
