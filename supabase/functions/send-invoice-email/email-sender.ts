
import { Resend } from "npm:resend@2.0.0";
import type { InvoiceData, ProfileData, BrandingData } from './types.ts';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

export async function sendInvoiceEmail(
  invoice: InvoiceData,
  profile: ProfileData | null,
  branding: BrandingData | null,
  clientEmail: string,
  clientName: string | undefined,
  invoiceHtml: { htmlContent: string; base64Html: string },
  total: number,
  currency: string,
  dueDate: Date
) {
  const businessName = branding?.freelancer_name || profile?.full_name || 'Ruzma';
  
  console.log('Sending invoice email with HTML attachment');
  
  try {
    // Create email with invoice content in body AND as attachment
    const emailResponse = await resend.emails.send({
      from: `${businessName} <notifications@ruzma.co>`,
      to: [clientEmail],
      subject: `Invoice ${invoice.transaction_id} from ${businessName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Invoice ${invoice.transaction_id}</h1>
            <p style="color: #666; font-size: 16px;">From ${businessName}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Dear ${clientName || 'Valued Client'},</strong></p>
            <p style="margin: 10px 0;">Please find your invoice attached to this email. You can view it directly in your browser or print it as needed.</p>
          </div>
          
          <div style="background: #ffffff; border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Invoice Summary:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; color: #666;">Invoice ID:</td>
                <td style="padding: 8px 0; font-weight: 500;">${invoice.transaction_id}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; color: #666;">Project:</td>
                <td style="padding: 8px 0; font-weight: 500;">${invoice.project_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; color: #666;">Amount:</td>
                <td style="padding: 8px 0; font-weight: 500; color: #007bff;">${total.toFixed(2)} ${currency}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Due Date:</td>
                <td style="padding: 8px 0; font-weight: 500;">${dueDate.toLocaleDateString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #0056b3;"><strong>📎 Attachment:</strong> Your complete invoice is attached as an HTML file that you can open in any web browser.</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <p style="color: #666; margin: 0;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
            <p style="margin: 0; color: #333; font-weight: 500;">Best regards,</p>
            <p style="margin: 5px 0 0 0; color: #007bff; font-weight: 500;">${businessName}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoice.transaction_id}.html`,
          content: invoiceHtml.base64Html,
          type: 'text/html',
          disposition: 'attachment'
        }
      ]
    });

    console.log('Invoice email sent successfully:', emailResponse);
    return emailResponse;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}
