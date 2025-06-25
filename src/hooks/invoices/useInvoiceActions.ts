
import { toast } from 'sonner';
import { Invoice } from './types';

export const useInvoiceActions = (
  invoices: Invoice[],
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>,
  generateTransactionId: () => string
) => {
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

  return {
    handleDownloadPDF,
    handleResendInvoice,
    handleDeleteInvoice
  };
};
