
import { useState } from 'react';
import { Invoice } from './types';
import { initialMockInvoices } from './mockInvoiceData';
import { InvoiceFormData } from '@/components/CreateInvoice/types';

export const useInvoiceData = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialMockInvoices);

  const generateTransactionId = () => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `TXN-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const generateInvoiceId = () => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const addInvoice = (invoiceData: InvoiceFormData) => {
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      transactionId: generateTransactionId(),
      amount: invoiceData.total,
      projectName: invoiceData.billedTo.name || 'New Project',
      date: invoiceData.invoiceDate,
      status: 'draft',
      projectId: crypto.randomUUID()
    };

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice.transactionId;
  };

  return {
    invoices,
    setInvoices,
    generateTransactionId,
    generateInvoiceId,
    addInvoice
  };
};
