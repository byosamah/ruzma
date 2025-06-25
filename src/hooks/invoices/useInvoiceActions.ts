
import { toast } from 'sonner';
import { Invoice } from './types';
import { generateInvoicePDF, InvoicePDFData } from '@/lib/pdfGenerator';

export const useInvoiceActions = (
  invoices: Invoice[],
  updateInvoice: (id: string, updates: Partial<Invoice>) => void,
  deleteInvoice: (id: string) => void
) => {
  const handleDownloadPDF = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      toast.error('Invoice not found');
      return;
    }

    try {
      toast.loading('Generating PDF...', { id: 'pdf-generation' });

      // Create invoice data for PDF generation
      const invoicePDFData: InvoicePDFData = {
        invoice,
        billedTo: {
          name: invoice.projectName,
          address: 'Client Address\nCity, State, ZIP'
        },
        payTo: {
          name: 'Your Business Name',
          address: 'Your Address\nCity, State, ZIP'
        },
        lineItems: [
          {
            description: `Project: ${invoice.projectName}`,
            quantity: 1,
            amount: invoice.amount
          }
        ],
        currency: 'USD'
      };

      await generateInvoicePDF(invoicePDFData);
      
      toast.success(`PDF downloaded successfully for ${invoice.transactionId}`, { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: 'pdf-generation' });
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
