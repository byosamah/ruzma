
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceStatus } from '@/hooks/invoices/types';
import { InvoiceFormData } from '@/components/CreateInvoice/types';

export interface DatabaseInvoice {
  id: string;
  user_id: string;
  transaction_id: string;
  amount: number;
  project_name: string;
  date: string;
  status: string;
  project_id: string | null;
  invoice_data: any;
  created_at: string;
  updated_at: string;
}

const convertToInvoice = (dbInvoice: DatabaseInvoice): Invoice => ({
  id: dbInvoice.id,
  transactionId: dbInvoice.transaction_id,
  amount: Number(dbInvoice.amount),
  projectName: dbInvoice.project_name,
  date: new Date(dbInvoice.date),
  status: dbInvoice.status as InvoiceStatus,
  projectId: dbInvoice.project_id || crypto.randomUUID()
});

const convertFromInvoice = (invoice: Invoice, userId: string, invoiceData?: InvoiceFormData) => ({
  user_id: userId,
  transaction_id: invoice.transactionId,
  amount: invoice.amount,
  project_name: invoice.projectName,
  date: invoice.date.toISOString().split('T')[0],
  status: invoice.status as string,
  project_id: invoice.projectId,
  invoice_data: invoiceData ? JSON.parse(JSON.stringify(invoiceData)) : null
});

export const invoiceService = {
  async getInvoices(userId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }

    return data?.map(convertToInvoice) || [];
  },

  async createInvoice(invoice: Invoice, userId: string, invoiceData?: InvoiceFormData): Promise<Invoice> {
    const dbInvoice = convertFromInvoice(invoice, userId, invoiceData);
    
    const { data, error } = await supabase
      .from('invoices')
      .insert(dbInvoice)
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }

    return convertToInvoice(data as DatabaseInvoice);
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.transactionId) dbUpdates.transaction_id = updates.transactionId;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.projectName) dbUpdates.project_name = updates.projectName;
    if (updates.date) dbUpdates.date = updates.date.toISOString().split('T')[0];
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.projectId) dbUpdates.project_id = updates.projectId;
    
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('invoices')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }
};
