
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  transactionId: string;
  amount: number;
  projectName: string;
  date: Date;
  status: InvoiceStatus;
  projectId: string;
}

// Mock data for demonstration
const initialMockInvoices: Invoice[] = [
  {
    id: '1',
    transactionId: 'TXN-2024-001',
    amount: 2500.00,
    projectName: 'Website Redesign',
    date: new Date('2024-01-15'),
    status: 'paid',
    projectId: 'proj-1'
  },
  {
    id: '2',
    transactionId: 'TXN-2024-002',
    amount: 1800.00,
    projectName: 'Mobile App Development',
    date: new Date('2024-01-20'),
    status: 'sent',
    projectId: 'proj-2'
  },
  {
    id: '3',
    transactionId: 'TXN-2024-003',
    amount: 3200.00,
    projectName: 'E-commerce Platform',
    date: new Date('2024-01-25'),
    status: 'overdue',
    projectId: 'proj-3'
  },
  {
    id: '4',
    transactionId: 'TXN-2024-004',
    amount: 950.00,
    projectName: 'Brand Identity Design',
    date: new Date('2024-02-01'),
    status: 'draft',
    projectId: 'proj-4'
  },
  {
    id: '5',
    transactionId: 'TXN-2024-005',
    amount: 4100.00,
    projectName: 'Data Analytics Dashboard',
    date: new Date('2024-02-10'),
    status: 'paid',
    projectId: 'proj-5'
  }
];

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialMockInvoices);
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

  const generateTransactionId = () => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `TXN-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleDownloadPDF = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      toast.success(`Downloading PDF for ${invoice.transactionId}`);
      // In a real app, this would trigger a PDF download
      console.log('Downloading PDF for invoice:', invoiceId);
    }
  };

  const handleResendInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      if (invoice.status === 'draft') {
        toast.error('Cannot resend a draft invoice. Please send it first.');
        return;
      }
      
      toast.success(`Invoice ${invoice.transactionId} has been resent`);
      console.log('Resending invoice:', invoiceId);
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      toast.success(`Invoice ${invoice.transactionId} has been deleted`);
      console.log('Deleted invoice:', invoiceId);
    }
  };

  const handleCreateInvoice = () => {
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      transactionId: generateTransactionId(),
      amount: 0,
      projectName: 'New Project',
      date: new Date(),
      status: 'draft',
      projectId: `proj-${Date.now()}`
    };
    
    setInvoices(prev => [newInvoice, ...prev]);
    toast.success(`New invoice ${newInvoice.transactionId} has been created`);
    console.log('Created new invoice:', newInvoice);
  };

  return {
    invoices: filteredInvoices,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleDownloadPDF,
    handleResendInvoice,
    handleDeleteInvoice,
    handleCreateInvoice
  };
};
