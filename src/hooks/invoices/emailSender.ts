import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { generateInvoicePDFBlob, InvoicePDFData } from '@/lib/pdfGenerator';
import { Invoice } from './types';

export const sendInvoiceToClient = async (invoice: Invoice, invoicePDFData: InvoicePDFData) => {
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
    throw new Error('Client email not found. Please add client email to the project.');
  }

  // Generate PDF using frontend generator
  const pdfBlob = await generateInvoicePDFBlob(invoicePDFData);
  
  // Convert PDF blob to base64 using chunked processing to prevent call stack overflow
  const pdfBase64 = await convertBlobToBase64(pdfBlob);

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

  return { success: true, clientEmail, data };
};

const convertBlobToBase64 = async (blob: Blob): Promise<string> => {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Process in chunks to avoid "Maximum call stack size exceeded" error
  const chunkSize = 8192;
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binaryString);
};