
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";
import jsPDFLib from 'npm:jspdf@2.5.1';

// Fix jsPDF import for Deno environment
const jsPDF = jsPDFLib.default || jsPDFLib.jsPDF || jsPDFLib;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceEmailRequest {
  invoiceId: string;
  clientEmail: string;
  clientName?: string;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, clientEmail, clientName }: InvoiceEmailRequest = await req.json();
    
    console.log('Processing invoice email request:', { invoiceId, clientEmail, clientName });

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Error fetching invoice:', invoiceError);
      throw new Error('Invoice not found');
    }

    // Fetch user profile and branding data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('currency, full_name, email')
      .eq('id', invoice.user_id)
      .single();

    const { data: branding, error: brandingError } = await supabase
      .from('freelancer_branding')
      .select('logo_url, freelancer_name, freelancer_title, freelancer_bio')
      .eq('user_id', invoice.user_id)
      .maybeSingle();

    console.log('Fetched profile and branding data');

    // Parse invoice data
    let originalData = null;
    if (invoice.invoice_data) {
      try {
        if (typeof invoice.invoice_data === 'string') {
          originalData = JSON.parse(invoice.invoice_data);
        } else if (typeof invoice.invoice_data === 'object') {
          originalData = invoice.invoice_data;
        }
      } catch (error) {
        console.error('Error parsing invoice data:', error);
      }
    }

    // Generate PDF content
    const invoiceDate = new Date(invoice.date);
    const dueDate = originalData?.dueDate ? new Date(originalData.dueDate) : new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const lineItems = originalData?.lineItems && Array.isArray(originalData.lineItems) && originalData.lineItems.length > 0 
      ? originalData.lineItems 
      : [{
          description: `Project: ${invoice.project_name}`,
          quantity: 1,
          amount: Number(invoice.amount)
        }];

    const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.amount), 0);
    const tax = originalData?.tax || 0;
    const total = subtotal + tax;
    const currency = originalData?.currency || profile?.currency || 'USD';

    // Create PDF with fixed constructor
    console.log('Creating PDF with fixed jsPDF constructor');
    const pdf = new jsPDF();
    
    // Add content to PDF
    pdf.setFontSize(24);
    pdf.text('Invoice', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Invoice ID: ${invoice.transaction_id}`, 20, 50);
    pdf.text(`Date: ${invoiceDate.toLocaleDateString()}`, 20, 60);
    pdf.text(`Due Date: ${dueDate.toLocaleDateString()}`, 20, 70);
    
    pdf.text('Billed to:', 20, 90);
    pdf.text(originalData?.billedTo?.name || clientName || 'Client', 20, 100);
    
    pdf.text('From:', 120, 90);
    pdf.text(originalData?.payTo?.name || branding?.freelancer_name || profile?.full_name || 'Your Business', 120, 100);
    
    // Line items
    let yPos = 130;
    pdf.text('Description', 20, yPos);
    pdf.text('Qty', 120, yPos);
    pdf.text('Amount', 160, yPos);
    
    yPos += 10;
    lineItems.forEach((item: any) => {
      pdf.text(item.description, 20, yPos);
      pdf.text(item.quantity.toString(), 120, yPos);
      pdf.text(`${(item.quantity * item.amount).toFixed(2)} ${currency}`, 160, yPos);
      yPos += 10;
    });
    
    // Totals
    yPos += 10;
    pdf.text(`Subtotal: ${subtotal.toFixed(2)} ${currency}`, 120, yPos);
    if (tax > 0) {
      yPos += 10;
      pdf.text(`Tax: ${tax.toFixed(2)} ${currency}`, 120, yPos);
    }
    yPos += 10;
    pdf.setFontSize(14);
    pdf.text(`Total: ${total.toFixed(2)} ${currency}`, 120, yPos);

    // Generate PDF buffer
    console.log('Generating PDF buffer');
    const pdfBuffer = pdf.output('arraybuffer');
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    // Send email with PDF attachment using correct from address
    const businessName = branding?.freelancer_name || profile?.full_name || 'Ruzma';
    
    console.log('Sending email with PDF attachment');
    const emailResponse = await resend.emails.send({
      from: `${businessName} <notifications@ruzma.co>`,
      to: [clientEmail],
      subject: `Invoice ${invoice.transaction_id} from ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice ${invoice.transaction_id}</h2>
          <p>Dear ${clientName || 'Valued Client'},</p>
          <p>Please find attached your invoice for the services provided.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Invoice Details:</h3>
            <p><strong>Invoice ID:</strong> ${invoice.transaction_id}</p>
            <p><strong>Project:</strong> ${invoice.project_name}</p>
            <p><strong>Amount:</strong> ${total.toFixed(2)} ${currency}</p>
            <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
          </div>
          
          <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          ${businessName}</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoice.transaction_id}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    console.log('Email sent successfully:', emailResponse);

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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send invoice email' 
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
