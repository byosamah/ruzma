
export interface InvoiceEmailRequest {
  invoiceId: string;
  clientEmail: string;
  clientName?: string;
}

export interface InvoiceData {
  id: string;
  transaction_id: string;
  amount: number;
  date: string;
  project_name: string;
  user_id: string;
  invoice_data?: any;
}

export interface ProfileData {
  currency?: string;
  full_name?: string;
  email?: string;
}

export interface BrandingData {
  logo_url?: string;
  freelancer_name?: string;
  freelancer_title?: string;
  freelancer_bio?: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  amount: number;
}

export interface ParsedInvoiceData {
  dueDate?: string;
  lineItems?: LineItem[];
  tax?: number;
  currency?: string;
  billedTo?: { name?: string };
  payTo?: { name?: string };
}
