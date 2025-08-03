
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { validateRequest, validateEnvironment } from './validation.ts';
import { initializeSupabase, fetchInvoice, fetchFreelancerInfo } from './database-operations.ts';
import { buildInvoiceEmail } from './email-builder.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sendEmailWithResend = async (
  freelancerName: string,
  clientEmail: string,
  subject: string,
  html: string,
  filename: string,
  pdfBase64: string
) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${freelancerName} <notifications@ruzma.co>`,
      to: [clientEmail],
      subject,
      html,
      attachments: [{ filename, content: pdfBase64 }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend API error - Status:', response.status, 'Response:', errorText);
    
    let errorMessage = 'Failed to send email';
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorText;
    } catch {
      errorMessage = errorText || `HTTP ${response.status}`;
    }
    
    throw new Error(`Email service error: ${errorMessage}`);
  }

  return await response.json();
};

const createErrorResponse = (error: string, status: number) => {
  return new Response(
    JSON.stringify({ success: false, error }),
    { 
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    }
  );
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const requestData = await req.json();
    
    // Validate request
    const validation = validateRequest(requestData);
    if (!validation.isValid) {
      console.error('Validation failed:', validation.error);
      return createErrorResponse(validation.error!, 400);
    }
    
    const { invoiceId, clientEmail, clientName, pdfBase64, filename } = validation.request!;
    
    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.error('Environment validation failed:', envValidation.error);
      return createErrorResponse(envValidation.error!, 500);
    }

    console.log(`Sending invoice ${invoiceId} to ${clientEmail}, PDF size: ${pdfBase64.length} chars`);

    // Initialize database and fetch data
    const supabase = initializeSupabase();
    const invoice = await fetchInvoice(supabase, invoiceId);
    const freelancerInfo = await fetchFreelancerInfo(supabase, invoice.user_id);

    // Build email content
    const { subject, html } = buildInvoiceEmail(
      invoice, 
      clientName, 
      freelancerInfo.freelancerName,
      freelancerInfo.currency,
      freelancerInfo.language
    );

    // Send email
    const emailResult = await sendEmailWithResend(
      freelancerInfo.freelancerName,
      clientEmail,
      subject,
      html,
      filename,
      pdfBase64
    );

    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invoice sent successfully to ${clientEmail}`,
        emailId: emailResult.id
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in send-invoice-with-frontend-pdf function:', error);
    
    if (error.message.includes('Invoice not found')) {
      return createErrorResponse('Invoice not found', 404);
    }
    
    if (error.message.includes('PDF file too large')) {
      return createErrorResponse('PDF file too large for email attachment', 413);
    }
    
    return createErrorResponse(error.message, 500);
  }
};

serve(handler);
