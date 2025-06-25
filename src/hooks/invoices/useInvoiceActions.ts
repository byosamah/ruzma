
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

      // Use stored invoice data if available, otherwise create fallback data
      let invoicePDFData: InvoicePDFData;
      
      if (invoice.invoiceData) {
        // Use the stored invoice data
        const originalData = invoice.invoiceData;
        invoicePDFData = {
          invoice,
          billedTo: {
            name: originalData.billedTo?.name || invoice.projectName,
            address: originalData.billedTo?.address || 'Client Address\nCity, State, ZIP'
          },
          payTo: {
            name: originalData.payTo?.name || branding?.freelancer_name || profile?.full_name || 'Your Business Name',
            address: originalData.payTo?.address || 'Your Address\nCity, State, ZIP'
          },
          lineItems: originalData.lineItems || [
            {
              description: `Project: ${invoice.projectName}`,
              quantity: 1,
              amount: invoice.amount
            }
          ],
          currency: originalData.currency || profile?.currency || 'USD',
          logoUrl: originalData.logoUrl || branding?.logo_url
        };
      } else {
        // Fallback data if original invoice data is not available
        invoicePDFData = {
          invoice,
          billedTo: {
            name: invoice.projectName,
            address: 'Client Address\nCity, State, ZIP'
          },
          payTo: {
            name: branding?.freelancer_name || profile?.full_name || 'Your Business Name',
            address: 'Your Address\nCity, State, ZIP'
          },
          lineItems: [
            {
              description: `Project: ${invoice.projectName}`,
              quantity: 1,
              amount: invoice.amount
            }
          ],
          currency: profile?.currency || 'USD',
          logoUrl: branding?.logo_url
        };
      }

      await generateInvoicePDF(invoicePDFData);
      
      toast.success(`PDF downloaded successfully for ${invoice.transactionId}`, { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.', { id: 'pdf-generation' });
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
