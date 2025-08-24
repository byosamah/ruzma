import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceStatus } from '@/hooks/invoices/types';
import { InvoiceFormData } from '@/components/CreateInvoice/types';
import { generateInvoicePDF, generateInvoicePDFBlob } from '@/lib/pdfGenerator';
import { trackInvoiceCreated } from '@/lib/analytics';
import { SharedInvoiceData } from '@/lib/shared/invoice/types';
import { toast } from 'sonner';

export interface DatabaseInvoice {
  id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  project_name: string;
  date: string;
  status: string;
  project_id: string | null;
  invoice_data: Record<string, unknown> | string | null;
  created_at: string;
  updated_at: string;
}

const convertToInvoice = (dbInvoice: DatabaseInvoice): Invoice => ({
  id: dbInvoice.id,
  transactionId: dbInvoice.transaction_id,
  amount: Number(dbInvoice.amount),
  projectName: dbInvoice.project_name,
  date: new Date(dbInvoice.date),
  status: dbInvoice.status as InvoiceStatus,
  projectId: dbInvoice.project_id || crypto.randomUUID(),
  invoiceData: parseInvoiceData(dbInvoice.invoice_data) || {}
});

const convertFromInvoice = (invoice: Invoice, userId: string, invoiceData?: InvoiceFormData) => ({
  user_id: userId,
  transaction_id: invoice.transactionId,
  amount: invoice.amount,
  project_name: invoice.projectName,
  date: invoice.date.toISOString().split('T')[0],
  status: invoice.status as string,
  project_id: invoice.projectId,
  invoice_data: invoiceData ? JSON.stringify(invoiceData) : null
});

// PDF Data Builder utility
const buildInvoicePDFData = async (invoice: Invoice): Promise<SharedInvoiceData> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Fetch user profile and branding
  const [profileResult, brandingResult] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('freelancer_branding').select('*').eq('user_id', user.id).single()
  ]);

  const profile = profileResult.data;
  const branding = brandingResult.data;

  if (!profile) {
    throw new Error('User profile not found');
  }

  const originalData = parseInvoiceData(invoice.invoiceData);
  const lineItems = getLineItems(originalData, invoice);

  // Type guard for billedTo
  const billedTo = originalData?.billedTo as { name?: string; address?: string } | undefined;
  
  const invoicePDFData: SharedInvoiceData = {
    invoice: {
      id: invoice.id,
      transactionId: invoice.transactionId,
      amount: invoice.amount,
      date: invoice.date,
      projectName: invoice.projectName
    },
    billedTo: {
      name: billedTo?.name || 'Client',
      address: billedTo?.address || 'Client Address'
    },
    payTo: {
      name: branding?.freelancer_name || profile.full_name || 'Freelancer',
      address: branding?.freelancer_bio || 'Freelancer Address'
    },
    lineItems,
    currency: typeof originalData?.currency === 'string' ? originalData.currency : 'USD',
    logoUrl: branding?.logo_url || null,
    purchaseOrder: typeof originalData?.purchaseOrder === 'string' ? originalData.purchaseOrder : '',
    paymentTerms: typeof originalData?.paymentTerms === 'string' ? originalData.paymentTerms : 'Net 30',
    tax: typeof originalData?.tax === 'number' ? originalData.tax : 0,
    invoiceDate: originalData?.invoiceDate ? new Date(originalData.invoiceDate as string | number | Date) : invoice.date,
    dueDate: originalData?.dueDate ? new Date(originalData.dueDate as string | number | Date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };

  validatePDFData(invoicePDFData);
  return invoicePDFData;
};

const parseInvoiceData = (invoiceData: Record<string, unknown> | string | null): Record<string, unknown> | null => {
  if (!invoiceData) return null;
  if (typeof invoiceData === 'string') {
    try {
      return JSON.parse(invoiceData) as Record<string, unknown>;
    } catch (error) {
      return null;
    }
  }
  return invoiceData;
};

const getLineItems = (originalData: Record<string, unknown> | null, invoice: Invoice) => {
  if (originalData?.lineItems && Array.isArray(originalData.lineItems)) {
    return originalData.lineItems;
  }
  return [{
    description: invoice.projectName,
    quantity: 1,
    amount: invoice.amount
  }];
};

const validatePDFData = (invoicePDFData: SharedInvoiceData) => {
  if (!invoicePDFData.billedTo.name) {
    throw new Error('Billing information is incomplete');
  }
  if (!invoicePDFData.lineItems || invoicePDFData.lineItems.length === 0) {
    throw new Error('No line items found');
  }
};

// Email sender utility
const convertBlobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const sendInvoiceToClient = async (invoice: Invoice, invoicePDFData: SharedInvoiceData) => {
  let clientEmail = '';
  
  // Try to get client email from project
  if (invoice.projectId) {
    try {
      const { data: project } = await supabase
        .from('projects')
        .select('client_email')
        .eq('id', invoice.projectId)
        .single();
      
      if (project?.client_email) {
        clientEmail = project.client_email;
      }
    } catch (error) {
      // Client email will be fetched from invoice data as fallback
    }
  }

  // Fallback: try to parse from invoice data
  if (!clientEmail) {
    const originalData = parseInvoiceData(invoice.invoiceData);
    clientEmail = typeof originalData?.selectedClientEmail === 'string' ? originalData.selectedClientEmail : '';
  }

  if (!clientEmail) {
    throw new Error('Client email not found. Please ensure the client has an email address.');
  }

  // Generate PDF - convert to the expected format
  const invoicePDFDataForPDF = {
    ...invoicePDFData,
    invoice: {
      ...invoicePDFData.invoice,
      status: invoice.status,
      projectId: invoice.projectId,
      invoiceData: invoice.invoiceData
    }
  };
  const pdfBlob = await generateInvoicePDFBlob(invoicePDFDataForPDF);
  const pdfBase64 = await convertBlobToBase64(pdfBlob);

  // Send email via edge function
  const { data, error } = await supabase.functions.invoke('send-invoice-with-frontend-pdf', {
    body: {
      invoiceId: invoice.id,
      clientEmail,
      clientName: invoicePDFData.billedTo.name,
      pdfBase64,
      filename: `Invoice-${invoice.transactionId}.pdf`
    }
  });

  if (error) {
    throw new Error(error.message || 'Failed to send invoice');
  }

  return { data, clientEmail };
};

export const invoiceService = {
  async getInvoices(userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data?.map((dbInvoice) => convertToInvoice(dbInvoice as DatabaseInvoice)) || [];
  },

  async createInvoice(invoice: Invoice, userId: string, invoiceData?: InvoiceFormData): Promise<Invoice> {
    const dbInvoice = convertFromInvoice(invoice, userId, invoiceData);
    
    const { data, error } = await supabase
      .from('invoices')
      .insert(dbInvoice)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Track invoice creation
    try {
      trackInvoiceCreated(invoice.transactionId, invoice.amount, invoiceData?.currency || 'USD');
    } catch (error) {
      // Analytics error - not critical for functionality
    }

    return convertToInvoice(data as DatabaseInvoice);
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    
    if (updates.transactionId) dbUpdates.transaction_id = updates.transactionId;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.projectName) dbUpdates.project_name = updates.projectName;
    if (updates.date) dbUpdates.date = updates.date.toISOString().split('T')[0];
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.projectId) dbUpdates.project_id = updates.projectId;
    
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('invoices')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  // Enhanced methods for PDF and email operations
  async downloadInvoicePDF(invoice: Invoice): Promise<void> {
    toast.loading('Generating PDF...', { id: 'pdf-generation' });

    try {
      const invoicePDFData = await buildInvoicePDFData(invoice);
      // Convert to the expected format for PDF generation
      const invoicePDFDataForPDF = {
        ...invoicePDFData,
        invoice: {
          ...invoicePDFData.invoice,
          status: invoice.status,
          projectId: invoice.projectId,
          invoiceData: invoice.invoiceData
        }
      };
      await generateInvoicePDF(invoicePDFDataForPDF);
      
      toast.success(`PDF downloaded successfully for ${invoice.transactionId}`, { id: 'pdf-generation' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF';
      toast.error(errorMessage, { id: 'pdf-generation' });
      throw error;
    }
  },

  async sendInvoiceToClient(invoice: Invoice): Promise<void> {
    if (invoice.status === 'draft') {
      toast.error('Cannot send a draft invoice. Please finalize it first.');
      return;
    }

    toast.loading('Generating and sending invoice...', { id: 'sending-invoice' });

    try {
      const invoicePDFData = await buildInvoicePDFData(invoice);
      const result = await sendInvoiceToClient(invoice, invoicePDFData);

      toast.success(`Invoice sent successfully to ${result.clientEmail}`, { id: 'sending-invoice' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invoice';
      toast.error(errorMessage, { id: 'sending-invoice' });
      throw error;
    }
  }
};
