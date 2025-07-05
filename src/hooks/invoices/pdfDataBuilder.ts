import { supabase } from '@/integrations/supabase/client';
import { Invoice } from './types';
import { InvoicePDFData } from '@/lib/pdfGenerator';

export const buildInvoicePDFData = async (invoice: Invoice): Promise<InvoicePDFData> => {
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
  const originalData = parseInvoiceData(invoice.invoiceData);
  console.log('Parsed invoice data:', originalData);

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
    lineItems: getLineItems(originalData, invoice),
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
  validatePDFData(invoicePDFData);

  return invoicePDFData;
};

const parseInvoiceData = (invoiceData: any) => {
  if (!invoiceData) return null;
  
  try {
    if (typeof invoiceData === 'string') {
      return JSON.parse(invoiceData);
    } else if (typeof invoiceData === 'object') {
      return invoiceData;
    }
  } catch (error) {
    console.error('Error parsing invoice data:', error);
  }
  
  return null;
};

const getLineItems = (originalData: any, invoice: Invoice) => {
  if (originalData?.lineItems && Array.isArray(originalData.lineItems) && originalData.lineItems.length > 0) {
    return originalData.lineItems;
  }
  
  return [
    {
      description: `Project: ${invoice.projectName}`,
      quantity: 1,
      amount: invoice.amount
    }
  ];
};

const validatePDFData = (invoicePDFData: InvoicePDFData) => {
  if (!invoicePDFData.billedTo.name || !invoicePDFData.payTo.name) {
    throw new Error('Missing required billing information');
  }

  if (!invoicePDFData.lineItems || invoicePDFData.lineItems.length === 0) {
    throw new Error('No line items found for invoice');
  }
};