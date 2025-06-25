
import { useInvoiceData } from './invoices/useInvoiceData';
import { useInvoiceFilters } from './invoices/useInvoiceFilters';
import { useInvoiceActions } from './invoices/useInvoiceActions';

// Re-export types for backward compatibility
export type { InvoiceStatus, Invoice } from './invoices/types';

export const useInvoices = () => {
  const { invoices, setInvoices, generateTransactionId } = useInvoiceData();
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredInvoices
  } = useInvoiceFilters(invoices);
  
  const {
    handleDownloadPDF,
    handleResendInvoice,
    handleDeleteInvoice
  } = useInvoiceActions(invoices, setInvoices, generateTransactionId);

  return {
    invoices: filteredInvoices,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleDownloadPDF,
    handleResendInvoice,
    handleDeleteInvoice
  };
};
