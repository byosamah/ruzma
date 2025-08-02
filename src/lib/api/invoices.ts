import { BaseAPI } from './base';
import { formatInvoiceNumber } from '@/lib/utils/formatting';

interface Invoice {
  id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  project_name: string;
  date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  project_id?: string;
  invoice_data?: any;
  created_at: string;
  updated_at: string;
}

export class InvoiceAPI extends BaseAPI<Invoice> {
  constructor() {
    super('invoices', '*');
  }

  /**
   * Generate next invoice number
   */
  async generateInvoiceNumber(userId: string, prefix: string = 'INV'): Promise<string> {
    // Get the count of existing invoices
    const { count } = await this.count({ user_id: userId });
    return formatInvoiceNumber(count + 1, prefix);
  }

  /**
   * Find invoices by status
   */
  async findByStatus(userId: string, status: Invoice['status']) {
    return this.findAll({ user_id: userId, status });
  }

  /**
   * Find invoices by date range
   */
  async findByDateRange(userId: string, startDate: string, endDate: string) {
    return this.executeRaw<Invoice[]>(
      (supabase) => supabase
        .from(this.tableName)
        .select(this.selectQuery)
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
    );
  }

  /**
   * Update invoice status
   */
  async updateStatus(id: string, status: Invoice['status']) {
    const update: any = { status };
    
    // Set payment date if marking as paid
    if (status === 'paid') {
      update.paid_at = new Date().toISOString();
    }
    
    return this.update(id, update);
  }

  /**
   * Get invoice statistics
   */
  async getStatistics(userId: string) {
    const invoices = await this.findAll({ user_id: userId });
    
    if (invoices.error || !invoices.data) {
      return { error: invoices.error, data: undefined };
    }

    const stats = {
      total: invoices.data.length,
      totalAmount: 0,
      byStatus: {
        draft: 0,
        sent: 0,
        paid: 0,
        overdue: 0,
        cancelled: 0
      },
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0
    };

    invoices.data.forEach(invoice => {
      stats.totalAmount += invoice.amount;
      stats.byStatus[invoice.status]++;
      
      if (invoice.status === 'paid') {
        stats.paidAmount += invoice.amount;
      } else if (invoice.status === 'overdue') {
        stats.overdueAmount += invoice.amount;
      } else if (invoice.status === 'sent') {
        stats.pendingAmount += invoice.amount;
      }
    });

    return { data: stats, error: undefined };
  }

  /**
   * Check for overdue invoices and update status
   */
  async updateOverdueInvoices(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    return this.executeRaw(
      (supabase) => supabase
        .from(this.tableName)
        .update({ status: 'overdue' })
        .eq('user_id', userId)
        .eq('status', 'sent')
        .lt('date', today)
    );
  }

  /**
   * Duplicate invoice
   */
  async duplicate(invoiceId: string) {
    const original = await this.findById(invoiceId);
    
    if (original.error || !original.data) {
      return original;
    }

    const { id, transaction_id, created_at, updated_at, ...invoiceData } = original.data;
    
    return this.create({
      ...invoiceData,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      transaction_id: await this.generateInvoiceNumber(invoiceData.user_id)
    });
  }
}