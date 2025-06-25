
import React, { createContext, useContext, ReactNode } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { InvoiceFormData } from '@/components/CreateInvoice/types';

interface InvoiceContextType {
  invoices: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: any;
  setStatusFilter: (status: any) => void;
  handleDownloadPDF: (id: string) => void;
  handleResendInvoice: (id: string) => void;
  handleDeleteInvoice: (id: string) => void;
  addInvoice: (invoiceData: InvoiceFormData) => string;
  generateInvoiceId: () => string;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const invoiceData = useInvoices();

  return (
    <InvoiceContext.Provider value={invoiceData}>
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
