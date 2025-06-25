
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Invoice, InvoiceStatus } from '@/hooks/useInvoices';
import { InvoiceFormData } from '@/components/CreateInvoice/types';
import { invoiceService } from '@/services/invoiceService';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { toast } from 'sonner';

interface InvoiceContextType {
  invoices: Invoice[];
  loading: boolean;
  addInvoice: (formData: InvoiceFormData, status: InvoiceStatus) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  generateInvoiceId: () => string;
  generateTransactionId: () => string;
  refreshInvoices: () => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Safely use useAuth with error handling
  let user = null;
  try {
    const authData = useAuth();
    user = authData.user;
  } catch (error) {
    console.log('Auth not available in current context');
  }

  const generateInvoiceId = () => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const generateTransactionId = () => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `TXN-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const convertFormDataToInvoice = (formData: InvoiceFormData, status: InvoiceStatus): Invoice => {
    return {
      id: crypto.randomUUID(),
      transactionId: generateTransactionId(),
      amount: formData.total,
      projectName: formData.billedTo.name || 'Unnamed Project',
      date: formData.invoiceDate,
      status: status,
      projectId: formData.projectId || crypto.randomUUID()
    };
  };

  const refreshInvoices = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const fetchedInvoices = await invoiceService.getInvoices(user.id);
      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error('Error refreshing invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (formData: InvoiceFormData, status: InvoiceStatus): Promise<Invoice> => {
    if (!user) throw new Error('User not authenticated');

    const newInvoice = convertFormDataToInvoice(formData, status);
    
    try {
      const createdInvoice = await invoiceService.createInvoice(newInvoice, user.id, formData);
      setInvoices(prev => [createdInvoice, ...prev]);
      
      const statusText = status === 'draft' ? 'saved as draft' : 'sent successfully';
      toast.success(`Invoice ${createdInvoice.transactionId} ${statusText}`);
      
      return createdInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      await invoiceService.updateInvoice(id, updates);
      setInvoices(prev => prev.map(invoice => 
        invoice.id === id ? { ...invoice, ...updates } : invoice
      ));
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    
    try {
      await invoiceService.deleteInvoice(id);
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      
      if (invoice) {
        toast.success(`Invoice ${invoice.transactionId} deleted`);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
      throw error;
    }
  };

  // Load invoices when user changes
  useEffect(() => {
    if (user) {
      refreshInvoices();
    } else {
      setInvoices([]);
      setLoading(false);
    }
  }, [user]);

  return (
    <InvoiceContext.Provider value={{
      invoices,
      loading,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      generateInvoiceId,
      generateTransactionId,
      refreshInvoices
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoiceContext must be used within an InvoiceProvider');
  }
  return context;
};
