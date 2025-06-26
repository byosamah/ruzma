
import { useInvoiceContext } from '@/contexts/InvoiceContext';
import { useInvoiceFilters } from './invoices/useInvoiceFilters';
import { useInvoiceActions } from './invoices/useInvoiceActions';

// Re-export types for backward compatibility
export type { InvoiceStatus, Invoice } from './invoices/types';

export const useInvoices = () => {
  const { invoices, loading, updateInvoice, deleteInvoice } = useInvoiceContext();
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredInvoices
  } = useInvoiceFilters(invoices);
  
  const {
    handleDownloadPDF,
    handleSendToClient,
    handleDeleteInvoice
  } = useInvoiceActions(invoices, updateInvoice, deleteInvoice);

  return {
    invoices: filteredInvoices,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleDownloadPDF,
    handleSendToClient,
    handleDeleteInvoice
  };
};
