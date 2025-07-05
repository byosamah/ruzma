interface EmailContent {
  subject: string;
  html: string;
}

export const buildInvoiceEmail = (
  invoice: any,
  clientName: string,
  freelancerName: string
): EmailContent => {
  const subject = `Invoice ${invoice.transaction_id} from ${invoice.project_name}`;
  
  const html = `
    <h2>Invoice ${invoice.transaction_id}</h2>
    <p>Dear ${clientName || 'Valued Client'},</p>
    <p>Please find your invoice attached for project: <strong>${invoice.project_name}</strong></p>
    <p><strong>Due Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
    <p>Thank you for your business!</p>
    <br>
    <p>Best regards,<br>${freelancerName}</p>
  `;

  return { subject, html };
};