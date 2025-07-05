
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendInvoiceRequest {
  invoiceId: string;
  clientEmail: string;
  clientName: string;
  pdfBase64: string;
  filename: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }

  try {
    const { invoiceId, clientEmail, clientName, pdfBase64, filename }: SendInvoiceRequest = await req.json();

    if (!invoiceId || !clientEmail || !pdfBase64 || !filename) {
      console.error('Missing required fields:', { invoiceId: !!invoiceId, clientEmail: !!clientEmail, pdfBase64: !!pdfBase64, filename: !!filename });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: invoiceId, clientEmail, pdfBase64, filename' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Validate payload size (base64 string should not be too large)
    if (pdfBase64.length > 10 * 1024 * 1024) { // 10MB limit for base64
      console.error('PDF payload too large:', pdfBase64.length);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PDF file too large for email attachment' 
        }),
        { 
          status: 413,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log(`Sending invoice ${invoiceId} to ${clientEmail}, PDF size: ${pdfBase64.length} chars`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the invoice details from database
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invoice not found' 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Get freelancer details for sender name
    const { data: branding, error: brandingError } = await supabase
      .from('freelancer_branding')
      .select('freelancer_name')
      .eq('user_id', invoice.user_id)
      .single();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', invoice.user_id)
      .single();

    // Use freelancer name from branding, or fallback to profile full_name, or default
    const freelancerName = branding?.freelancer_name || profile?.full_name || 'Your Freelancer';

    // Validate base64 format
    try {
      atob(pdfBase64); // Test if valid base64
    } catch (e) {
      console.error('Invalid base64 PDF data:', e);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid PDF data format' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${freelancerName} <notifications@ruzma.co>`,
        to: [clientEmail],
        subject: `Invoice ${invoice.transaction_id} from ${invoice.project_name}`,
        html: `
          <h2>Invoice ${invoice.transaction_id}</h2>
          <p>Dear ${clientName || 'Valued Client'},</p>
          <p>Please find your invoice attached for project: <strong>${invoice.project_name}</strong></p>
          <p><strong>Due Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
          <p>Thank you for your business!</p>
          <br>
          <p>Best regards,<br>${freelancerName}</p>
        `,
        attachments: [
          {
            filename: filename,
            content: pdfBase64
          }
        ]
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error - Status:', emailResponse.status, 'Response:', errorText);
      
      let errorMessage = 'Failed to send email';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorText;
      } catch {
        errorMessage = errorText || `HTTP ${emailResponse.status}`;
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Email service error: ${errorMessage}` 
        }),
        { 
          status: 502,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    const emailResult = await emailResponse.json();
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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
