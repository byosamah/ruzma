
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  transactionId: string;
  amount: number;
  projectName: string;
  date: Date;
  status: InvoiceStatus;
  projectId: string;
  invoiceData?: Record<string, unknown>; // Store the original InvoiceFormData
}
