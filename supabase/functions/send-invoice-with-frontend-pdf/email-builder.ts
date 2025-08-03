interface EmailContent {
  subject: string;
  html: string;
}

import { formatCurrency } from '../_shared/currency.ts';

export const buildInvoiceEmail = (
  invoice: any,
  clientName: string,
  freelancerName: string,
  currency: string = 'USD',
  language: 'en' | 'ar' = 'en'
): EmailContent => {
  const subject = `Invoice ${invoice.transaction_id} from ${invoice.project_name}`;
  
  const formattedAmount = formatCurrency(Number(invoice.amount), currency, language);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4B72E5; margin: 0; font-size: 28px; font-weight: bold;">
          Invoice ${invoice.transaction_id}
        </h1>
        <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">
          ${invoice.project_name}
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4B72E5;">
        <p style="margin: 0; font-size: 16px; color: #333;">
          Dear ${clientName || 'Valued Client'},
        </p>
        <p style="margin: 10px 0; font-size: 16px; color: #333;">
          Please find your invoice attached for project: <strong>${invoice.project_name}</strong>
        </p>
      </div>

      <div style="background: #fff; border: 1px solid #e9ecef; padding: 25px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #f1f3f4; padding-bottom: 10px;">
          📄 Invoice Details
        </h3>
        <div style="display: grid; gap: 15px;">
          <div>
            <strong style="color: #495057;">Invoice Number:</strong>
            <span style="color: #333; margin-left: 10px;">${invoice.transaction_id}</span>
          </div>
          <div>
            <strong style="color: #495057;">Project:</strong>
            <span style="color: #333; margin-left: 10px;">${invoice.project_name}</span>
          </div>
          <div>
            <strong style="color: #495057;">Amount:</strong>
            <span style="color: #28a745; font-size: 18px; font-weight: bold; margin-left: 10px;">${formattedAmount}</span>
          </div>
          <div>
            <strong style="color: #495057;">Due Date:</strong>
            <span style="color: #333; margin-left: 10px;">${new Date(invoice.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; color: #856404;">
          <strong>📎 Attachment:</strong> Please find the detailed invoice PDF attached to this email.
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #e9ecef; text-align: center;">
        <p style="margin: 0; font-size: 16px; color: #333;">
          Thank you for your business!
        </p>
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
          Best regards,<br>
          <strong style="color: #4B72E5;">${freelancerName}</strong>
        </p>
      </div>
    </div>
  `;

  return { subject, html };
};