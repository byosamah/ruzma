
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Invoice, InvoiceStatus } from '@/hooks/useInvoices';
import { InvoiceFormData } from '@/components/CreateInvoice/types';
import { initialMockInvoices } from '@/hooks/invoices/mockInvoiceData';
import { toast } from 'sonner';

interface InvoiceContextType {
  invoices: Invoice[];
  addInvoice: (formData: InvoiceFormData, status: InvoiceStatus) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  generateInvoiceId: () => string;
  generateTransactionId: () => string;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialMockInvoices);

  const generateInvoiceId = () => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const generateTransactionId = () => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `TXN-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const convertFormDataToInvoice = (formData: InvoiceFormData, status: InvoiceStatus): Invoice => {
    return {
      id: crypto.randomUUID(),
      transactionId: generateTransactionId(),
      amount: formData.total,
      projectName: formData.billedTo.name || 'Unnamed Project',
      date: formData.invoiceDate,
      status: status,
      projectId: crypto.randomUUID() // Generate a project ID for now
    };
  };

  const addInvoice = (formData: InvoiceFormData, status: InvoiceStatus): Invoice => {
    const newInvoice = convertFormDataToInvoice(formData, status);
    setInvoices(prev => [newInvoice, ...prev]);
    
    const statusText = status === 'draft' ? 'saved as draft' : 'sent successfully';
    toast.success(`Invoice ${newInvoice.transactionId} ${statusText}`);
    
    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === id ? { ...invoice, ...updates } : invoice
    ));
  };

  const deleteInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    if (invoice) {
      toast.success(`Invoice ${invoice.transactionId} deleted`);
    }
  };

  return (
    <InvoiceContext.Provider value={{
      invoices,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      generateInvoiceId,
      generateTransactionId
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoiceContext must be used within an InvoiceProvider');
  }
  return context;
};
