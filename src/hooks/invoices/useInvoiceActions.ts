
import { toast } from 'sonner';
import { Invoice } from './types';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { trackInvoiceCreated } from '@/lib/analytics';
import { buildInvoicePDFData } from './pdfDataBuilder';
import { sendInvoiceToClient } from './emailSender';

export const useInvoiceActions = (
  invoices: Invoice[],
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>,
  deleteInvoice: (id: string) => Promise<void>
) => {
  const handleDownloadPDF = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      toast.error('Invoice not found');
      return;
    }

    try {
      toast.loading('Generating PDF...', { id: 'pdf-generation' });
      console.log('Starting PDF generation for invoice:', invoice);

      const invoicePDFData = await buildInvoicePDFData(invoice);
      await generateInvoicePDF(invoicePDFData);
      
      toast.success(`PDF downloaded successfully for ${invoice.transactionId}`, { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to generate PDF: ${error.message}`, { id: 'pdf-generation' });
    }
  };

  const handleSendToClient = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      toast.error('Invoice not found');
      return;
    }

    if (invoice.status === 'draft') {
      toast.error('Cannot send a draft invoice. Please finalize it first.');
      return;
    }

    try {
      toast.loading('Generating and sending invoice...', { id: 'sending-invoice' });
      console.log('Sending invoice to client:', invoiceId);

      const invoicePDFData = await buildInvoicePDFData(invoice);
      const result = await sendInvoiceToClient(invoice, invoicePDFData);

      toast.success(`Invoice sent successfully to ${result.clientEmail}`, { id: 'sending-invoice' });
      console.log('Invoice email sent successfully:', result.data);

    } catch (error) {
      console.error('Error sending invoice to client:', error);
      toast.error(`Failed to send invoice: ${error.message}`, { id: 'sending-invoice' });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  // New function to track invoice creation
  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      // Track invoice creation
      trackInvoiceCreated(invoiceData.invoiceId, invoiceData.total, invoiceData.currency);
    } catch (error) {
      console.error('Error tracking invoice creation:', error);
    }
  };

  return {
    handleDownloadPDF,
    handleSendToClient,
    handleDeleteInvoice,
    handleCreateInvoice
  };
};
