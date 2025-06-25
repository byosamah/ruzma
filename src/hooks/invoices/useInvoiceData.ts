
import { useState } from 'react';
import { Invoice } from './types';
import { initialMockInvoices } from './mockInvoiceData';

export const useInvoiceData = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialMockInvoices);

  const generateTransactionId = () => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `TXN-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  return {
    invoices,
    setInvoices,
    generateTransactionId
  };
};
