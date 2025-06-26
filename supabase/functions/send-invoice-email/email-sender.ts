
import { Resend } from "npm:resend@2.0.0";
import type { InvoiceData, ProfileData, BrandingData } from './types.ts';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

export async function sendInvoiceEmail(
  invoice: InvoiceData,
  profile: ProfileData | null,
  branding: BrandingData | null,
  clientEmail: string,
  clientName: string | undefined,
  pdfBase64: string,
  total: number,
  currency: string,
  dueDate: Date
) {
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
  return emailResponse;
}
