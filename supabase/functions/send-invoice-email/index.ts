
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import type { InvoiceEmailRequest } from './types.ts';
import { fetchInvoiceData, fetchUserProfile, fetchBrandingData } from './database.ts';
import { parseInvoiceData, generateLineItems, calculateTotals } from './invoice-parser.ts';
import { generateInvoicePDF } from './pdf-generator.ts';
import { sendInvoiceEmail } from './email-sender.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting invoice email process');
    
    const { invoiceId, clientEmail, clientName }: InvoiceEmailRequest = await req.json();
    
    console.log('Processing invoice email request:', { invoiceId, clientEmail, clientName });

    // Validate input
    if (!invoiceId || !clientEmail) {
      throw new Error('Missing required fields: invoiceId and clientEmail');
    }

    // Fetch all required data
    const invoice = await fetchInvoiceData(invoiceId);
    console.log('Fetched invoice data successfully');
    
    const profile = await fetchUserProfile(invoice.user_id);
    console.log('Fetched user profile');
    
    const branding = await fetchBrandingData(invoice.user_id);
    console.log('Fetched branding data');

    // Parse invoice data
    const originalData = parseInvoiceData(invoice);
    console.log('Parsed invoice data');

    // Generate invoice calculations
    const invoiceDate = new Date(invoice.date);
    const dueDate = originalData?.dueDate ? new Date(originalData.dueDate) : new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const lineItems = generateLineItems(invoice, originalData);
    const { subtotal, total } = calculateTotals(lineItems, originalData?.tax || 0);
    const currency = originalData?.currency || profile?.currency || 'USD';

    console.log('Generated calculations:', { subtotal, total, currency });

    // Generate invoice PDF
    console.log('Starting PDF generation');
    const pdfData = await generateInvoicePDF(
      invoice,
      profile,
      branding,
      originalData,
      lineItems,
      subtotal,
      total,
      currency,
      clientName
    );
    console.log('PDF generation completed');

    // Send email with PDF attachment
    console.log('Sending email with PDF attachment');
    const emailResponse = await sendInvoiceEmail(
      invoice,
      profile,
      branding,
      clientEmail,
      clientName,
      pdfData,
      total,
      currency,
      dueDate
    );
    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invoice sent successfully',
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-invoice-email function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send invoice email',
        details: error.stack 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
