import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Invoice, InvoiceStatus } from './invoices/types';
import { InvoiceFormData, LineItem } from '@/components/CreateInvoice/types';
import { invoiceService } from '@/services/invoiceService';
import { useInvoiceContext } from '@/contexts/InvoiceContext';
import { toast } from 'sonner';

export const useInvoiceManager = () => {
  const { invoices, loading, updateInvoice, deleteInvoice, addInvoice } = useInvoiceContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Filter invoices based on search and status
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Invoice actions
  const handleDownloadPDF = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      toast.error('Invoice not found');
      return;
    }

    try {
      await invoiceService.downloadInvoicePDF(invoice);
    } catch (error) {
      toast.error('Failed to download PDF. Please try again.');
    }
  };

  const handleSendToClient = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      toast.error('Invoice not found');
      return;
    }

    try {
      await invoiceService.sendInvoiceToClient(invoice);
    } catch (error) {
      toast.error('Failed to send invoice to client. Please try again.');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId);
    } catch (error) {
      toast.error('Failed to delete invoice. Please try again.');
    }
  };

  // Form management for create invoice
  const updateLineItem = (
    invoiceData: InvoiceFormData,
    setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceFormData>>,
    id: string, 
    field: keyof LineItem, 
    value: string | number | boolean | null
  ) => {
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

  const addLineItem = (
    invoiceData: InvoiceFormData,
    setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceFormData>>
  ) => {
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

  const removeLineItem = (
    invoiceData: InvoiceFormData,
    setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceFormData>>,
    id: string
  ) => {
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

  const updateTax = (
    invoiceData: InvoiceFormData,
    setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceFormData>>,
    taxAmount: number
  ) => {
    setInvoiceData(prev => ({
      ...prev,
      tax: taxAmount,
      total: prev.subtotal + taxAmount
    }));
  };

  // Form validation and submission
  const validateForSending = (invoiceData: InvoiceFormData) => {
    if (!invoiceData.invoiceId.trim()) {
      toast.error('Please enter an invoice ID');
      return false;
    }
    if (!invoiceData.billedTo.name.trim()) {
      toast.error('Please enter client name');
      return false;
    }
    if (invoiceData.lineItems.every(item => !item.description.trim())) {
      toast.error('Please add at least one line item with description');
      return false;
    }
    return true;
  };

  const handleSendInvoice = async (invoiceData: InvoiceFormData) => {
    if (!validateForSending(invoiceData)) return;
    
    setIsLoading(true);
    try {
      addInvoice(invoiceData, 'sent');
      // Navigate to invoices page after successful send
      setTimeout(() => {
        navigate('/invoices');
      }, 1000);
    } catch (error) {
      toast.error('Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Invoice list management
    invoices: filteredInvoices,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    
    // Invoice actions
    handleDownloadPDF,
    handleSendToClient,
    handleDeleteInvoice,
    
    // Form management
    updateLineItem,
    addLineItem,
    removeLineItem,
    updateTax,
    
    // Form validation and submission
    handleSendInvoice,
    isLoading
  };
};