import { Invoice, InvoiceFormData, InvoiceItem } from '@/types/invoice';

export interface InvoiceFilters {
  status?: string | null;
  clientId?: string | null;
  projectId?: string | null;
  search?: string;
  dateRange?: { start?: string; end?: string } | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceListOptions extends InvoiceFilters {
  page?: number;
  limit?: number;
}

export interface InvoiceResult {
  data?: Invoice;
  error?: string;
}

export interface InvoiceListResult {
  data?: Invoice[];
  total?: number;
  error?: string;
}

export interface InvoiceStatistics {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface IInvoiceService {
  // CRUD operations
  create(data: InvoiceFormData): Promise<InvoiceResult>;
  get(id: string): Promise<InvoiceResult>;
  list(options?: InvoiceListOptions): Promise<InvoiceListResult>;
  update(id: string, data: Partial<InvoiceFormData>): Promise<InvoiceResult>;
  delete(id: string): Promise<{ error?: string }>;
  
  // Invoice-specific operations
  getByNumber(invoiceNumber: string): Promise<InvoiceResult>;
  generateNumber(): Promise<{ data?: string; error?: string }>;
  
  // Status operations
  markAsPaid(id: string): Promise<InvoiceResult>;
  markAsSent(id: string): Promise<InvoiceResult>;
  markAsCancelled(id: string): Promise<InvoiceResult>;
  
  // Statistics
  getStatistics(userId: string): Promise<{
    data?: InvoiceStatistics;
    error?: string;
  }>;
  
  // Calculations
  calculateTotal(items: InvoiceItem[]): number;
  calculateTax(subtotal: number, taxRate: number): number;
  
  // Email operations
  sendInvoice(id: string): Promise<{ error?: string }>;
  sendReminder(id: string): Promise<{ error?: string }>;
}