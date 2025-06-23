
import { useState, useMemo } from 'react';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  transactionId: string;
  amount: number;
  projectName: string;
  date: Date;
  status: InvoiceStatus;
  projectId?: string;
}

// Mock data for invoices
const mockInvoices: Invoice[] = [
  {
    id: '1',
    transactionId: 'TXN-001',
    amount: 2500.00,
    projectName: 'Website Redesign',
    date: new Date('2024-06-15'),
    status: 'paid',
    projectId: 'proj1'
  },
  {
    id: '2',
    transactionId: 'TXN-002',
    amount: 1800.50,
    projectName: 'Mobile App Development',
    date: new Date('2024-06-18'),
    status: 'sent',
    projectId: 'proj2'
  },
  {
    id: '3',
    transactionId: 'TXN-003',
    amount: 3200.00,
    projectName: 'E-commerce Platform',
    date: new Date('2024-06-10'),
    status: 'overdue',
    projectId: 'proj3'
  },
  {
    id: '4',
    transactionId: 'TXN-004',
    amount: 950.75,
    projectName: 'Brand Identity Package',
    date: new Date('2024-06-20'),
    status: 'draft',
    projectId: 'proj4'
  },
  {
    id: '5',
    transactionId: 'TXN-005',
    amount: 4100.00,
    projectName: 'SaaS Dashboard',
    date: new Date('2024-06-05'),
    status: 'cancelled',
    projectId: 'proj5'
  }
];

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const downloadPDF = (invoiceId: string) => {
    console.log(`Downloading PDF for invoice ${invoiceId}`);
    // Implementation for PDF download would go here
  };

  const resendInvoice = (invoiceId: string) => {
    console.log(`Resending invoice ${invoiceId}`);
    // Implementation for resending invoice would go here
  };

  const deleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    console.log(`Deleted invoice ${invoiceId}`);
  };

  const createInvoice = () => {
    console.log('Creating new invoice');
    // Implementation for creating new invoice would go here
  };

  return {
    invoices: filteredInvoices,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    downloadPDF,
    resendInvoice,
    deleteInvoice,
    createInvoice
  };
};
