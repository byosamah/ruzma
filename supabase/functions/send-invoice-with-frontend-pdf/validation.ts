export interface SendInvoiceRequest {
  invoiceId: string;
  clientEmail: string;
  clientName: string;
  pdfBase64: string;
  filename: string;
}

export const validateRequest = (data: any): { isValid: boolean; error?: string; request?: SendInvoiceRequest } => {
  const { invoiceId, clientEmail, clientName, pdfBase64, filename } = data;

  if (!invoiceId || !clientEmail || !pdfBase64 || !filename) {
    return {
      isValid: false,
      error: 'Missing required fields: invoiceId, clientEmail, pdfBase64, filename'
    };
  }

  if (pdfBase64.length > 10 * 1024 * 1024) {
    return {
      isValid: false,
      error: 'PDF file too large for email attachment'
    };
  }

  try {
    atob(pdfBase64);
  } catch {
    return {
      isValid: false,
      error: 'Invalid PDF data format'
    };
  }

  return {
    isValid: true,
    request: { invoiceId, clientEmail, clientName, pdfBase64, filename }
  };
};

export const validateEnvironment = (): { isValid: boolean; error?: string } => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return {
      isValid: false,
      error: 'Email service not configured'
    };
  }

  return { isValid: true };
};