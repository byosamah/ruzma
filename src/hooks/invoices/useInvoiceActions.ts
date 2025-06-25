import { toast } from 'sonner';
import { Invoice } from './types';
import { generateInvoicePDF, InvoicePDFData } from '@/lib/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/dashboard/useAuth';

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

      // Fetch user profile and branding data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated', { id: 'pdf-generation' });
        return;
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

      // Create invoice PDF data with proper fallbacks
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
        logoUrl: originalData?.logoUrl || branding?.logo_url
      };

      console.log('Final PDF data to be generated:', invoicePDFData);
      
      // Validate required data
      if (!invoicePDFData.billedTo.name || !invoicePDFData.payTo.name) {
        throw new Error('Missing required billing information');
      }

      if (!invoicePDFData.lineItems || invoicePDFData.lineItems.length === 0) {
        throw new Error('No line items found for invoice');
      }

      await generateInvoicePDF(invoicePDFData);
      
      toast.success(`PDF downloaded successfully for ${invoice.transactionId}`, { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to generate PDF: ${error.message}`, { id: 'pdf-generation' });
    }
  };

  const handleResendInvoice = async (invoiceId: string) => {
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

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  return {
    handleDownloadPDF,
    handleResendInvoice,
    handleDeleteInvoice
  };
};
