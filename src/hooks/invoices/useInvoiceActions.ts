
import { toast } from 'sonner';
import { Invoice } from './types';

export const useInvoiceActions = (
  invoices: Invoice[],
  updateInvoice: (id: string, updates: Partial<Invoice>) => void,
  deleteInvoice: (id: string) => void
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
    deleteInvoice(invoiceId);
  };

  return {
    handleDownloadPDF,
    handleResendInvoice,
    handleDeleteInvoice
  };
};
