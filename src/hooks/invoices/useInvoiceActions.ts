
import { toast } from 'sonner';
import { Invoice } from './types';
import { generateInvoicePDF, generateInvoicePDFBlob, InvoicePDFData } from '@/lib/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { trackInvoiceCreated } from '@/lib/analytics';
import { format } from 'date-fns';

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

      // Get client email from project if available
      let clientEmail = '';
      let clientName = '';

      if (invoice.projectId) {
        const { data: project } = await supabase
          .from('projects')
          .select('client_email, name')
          .eq('id', invoice.projectId)
          .single();

        if (project?.client_email) {
          clientEmail = project.client_email;
        }
      }

      // If no project email, try to get from invoice data
      if (!clientEmail && invoice.invoiceData) {
        try {
          const invoiceData = typeof invoice.invoiceData === 'string' 
            ? JSON.parse(invoice.invoiceData) 
            : invoice.invoiceData;
          
          if (invoiceData?.billedTo?.name) {
            clientName = invoiceData.billedTo.name;
          }
        } catch (error) {
          console.error('Error parsing invoice data for client info:', error);
        }
      }

      if (!clientEmail) {
        toast.error('Client email not found. Please add client email to the project.', { id: 'sending-invoice' });
        return;
      }

      // Generate PDF using frontend generator
      const invoicePDFData = await buildInvoicePDFData(invoice);
      const pdfBlob = await generateInvoicePDFBlob(invoicePDFData);
      
      // Convert PDF blob to base64
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = String.fromCharCode(...uint8Array);
      const pdfBase64 = btoa(binaryString);

      const filename = `Invoice-${invoice.transactionId}-${format(invoice.date, 'yyyy-MM-dd')}.pdf`;

      // Send to edge function
      const { data, error } = await supabase.functions.invoke('send-invoice-with-frontend-pdf', {
        body: {
          invoiceId: invoice.id,
          clientEmail: clientEmail,
          clientName: clientName || invoice.projectName,
          pdfBase64: pdfBase64,
          filename: filename
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send invoice email');
      }

      toast.success(`Invoice sent successfully to ${clientEmail}`, { id: 'sending-invoice' });
      console.log('Invoice email sent successfully:', data);

    } catch (error) {
      console.error('Error sending invoice to client:', error);
      toast.error(`Failed to send invoice: ${error.message}`, { id: 'sending-invoice' });
    }
  };

  const buildInvoicePDFData = async (invoice: Invoice): Promise<InvoicePDFData> => {
    // Fetch user profile and branding data
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fetch user profile for currency and business info
    const { data: profile } = await supabase
      .from('profiles')
      .select('currency, full_name, email')
      .eq('id', user.id)
      .single();

    // Fetch user branding for logo and business details
    const { data: branding } = await supabase
      .from('freelancer_branding')
      .select('logo_url, freelancer_name, freelancer_title, freelancer_bio')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('User profile:', profile);
    console.log('User branding:', branding);
    console.log('Invoice data (raw):', invoice.invoiceData);

    // Parse stored invoice data properly
    let originalData = null;
    if (invoice.invoiceData) {
      try {
        if (typeof invoice.invoiceData === 'string') {
          originalData = JSON.parse(invoice.invoiceData);
        } else if (typeof invoice.invoiceData === 'object') {
          originalData = invoice.invoiceData;
        }
        console.log('Parsed invoice data:', originalData);
      } catch (error) {
        console.error('Error parsing invoice data:', error);
        originalData = null;
      }
    }

    // Create invoice PDF data with all the correct information
    const invoicePDFData: InvoicePDFData = {
      invoice,
      billedTo: {
        name: originalData?.billedTo?.name || invoice.projectName || 'Client Name',
        address: originalData?.billedTo?.address || 'Client Address\nCity, State, ZIP'
      },
      payTo: {
        name: originalData?.payTo?.name || branding?.freelancer_name || profile?.full_name || 'Your Business Name',
        address: originalData?.payTo?.address || 'Your Business Address\nCity, State, ZIP'
      },
      lineItems: originalData?.lineItems && Array.isArray(originalData.lineItems) && originalData.lineItems.length > 0 
        ? originalData.lineItems 
        : [
            {
              description: `Project: ${invoice.projectName}`,
              quantity: 1,
              amount: invoice.amount
            }
          ],
      currency: originalData?.currency || profile?.currency || 'USD',
      logoUrl: originalData?.logoUrl || branding?.logo_url,
      purchaseOrder: originalData?.purchaseOrder || '',
      paymentTerms: originalData?.paymentTerms || '',
      tax: originalData?.tax || 0,
      invoiceDate: originalData?.invoiceDate ? new Date(originalData.invoiceDate) : invoice.date,
      dueDate: originalData?.dueDate ? new Date(originalData.dueDate) : new Date(invoice.date.getTime() + 30 * 24 * 60 * 60 * 1000)
    };

    console.log('Final PDF data to be generated:', invoicePDFData);
    
    // Validate required data
    if (!invoicePDFData.billedTo.name || !invoicePDFData.payTo.name) {
      throw new Error('Missing required billing information');
    }

    if (!invoicePDFData.lineItems || invoicePDFData.lineItems.length === 0) {
      throw new Error('No line items found for invoice');
    }

    return invoicePDFData;
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
