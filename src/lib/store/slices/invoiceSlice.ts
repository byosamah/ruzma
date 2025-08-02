import { StateCreator } from 'zustand';
import { InvoiceAPI } from '@/lib/api/invoices';
import { Invoice, InvoiceFormData, InvoiceItem } from '@/types/invoice';

const invoiceAPI = new InvoiceAPI();

export interface InvoiceFilters {
  status: string | null;
  clientId: string | null;
  projectId: string | null;
  search: string;
  dateRange: { start?: string; end?: string } | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface InvoiceSlice {
  // State
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  draftInvoice: Partial<InvoiceFormData> | null;
  filters: InvoiceFilters;
  totalCount: number;
  statistics: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  setCurrentInvoice: (invoice: Invoice | null) => void;
  setDraftInvoice: (draft: Partial<InvoiceFormData> | null) => void;
  updateDraftInvoice: (updates: Partial<InvoiceFormData>) => void;
  setFilters: (filters: Partial<InvoiceFilters>) => void;
  resetFilters: () => void;
  
  // API operations
  fetchInvoices: (page?: number, pageSize?: number) => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  createInvoice: (data: InvoiceFormData) => Promise<{ data?: Invoice; error?: string }>;
  updateInvoice: (id: string, data: Partial<InvoiceFormData>) => Promise<{ error?: string }>;
  deleteInvoice: (id: string) => Promise<{ error?: string }>;
  sendInvoice: (id: string) => Promise<{ error?: string }>;
  markAsPaid: (id: string) => Promise<{ error?: string }>;
  generateInvoiceNumber: () => Promise<string>;
  
  // Computed values
  getInvoiceById: (id: string) => Invoice | undefined;
  getInvoicesByStatus: (status: string) => Invoice[];
  getOverdueInvoices: () => Invoice[];
  calculateTotal: (items: InvoiceItem[]) => number;
}

const defaultFilters: InvoiceFilters = {
  status: null,
  clientId: null,
  projectId: null,
  search: '',
  dateRange: null,
  sortBy: 'created_at',
  sortOrder: 'desc'
};

export const createInvoiceSlice: StateCreator<InvoiceSlice> = (set, get) => ({
  // Initial state
  invoices: [],
  currentInvoice: null,
  draftInvoice: null,
  filters: defaultFilters,
  totalCount: 0,
  statistics: {
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
  },
  isLoading: false,
  error: null,
  
  // Actions
  setInvoices: (invoices) => set({ invoices }),
  
  setCurrentInvoice: (currentInvoice) => set({ currentInvoice }),
  
  setDraftInvoice: (draftInvoice) => {
    set({ draftInvoice });
    if (draftInvoice) {
      localStorage.setItem('ruzma_draft_invoice', JSON.stringify(draftInvoice));
    } else {
      localStorage.removeItem('ruzma_draft_invoice');
    }
  },
  
  updateDraftInvoice: (updates) => {
    set((state) => ({
      draftInvoice: state.draftInvoice 
        ? { ...state.draftInvoice, ...updates }
        : updates
    }));
    const draft = get().draftInvoice;
    if (draft) {
      localStorage.setItem('ruzma_draft_invoice', JSON.stringify(draft));
    }
  },
  
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  // API operations
  fetchInvoices: async (page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    
    try {
      const { filters } = get();
      const result = await invoiceAPI.list({
        page,
        limit: pageSize,
        status: filters.status,
        client_id: filters.clientId,
        project_id: filters.projectId,
        search: filters.search,
        start_date: filters.dateRange?.start,
        end_date: filters.dateRange?.end,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder
      });
      
      if (result.error) throw new Error(result.error);
      
      set({
        invoices: result.data || [],
        totalCount: result.total || 0,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
  
  fetchInvoice: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await invoiceAPI.get(id);
      
      if (result.error) throw new Error(result.error);
      
      set({
        currentInvoice: result.data || null,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
  
  fetchStatistics: async () => {
    try {
      const result = await invoiceAPI.getStatistics();
      
      if (result.error) throw new Error(result.error);
      
      if (result.data) {
        set({ statistics: result.data });
      }
    } catch (error: any) {
      console.error('Failed to fetch invoice statistics:', error);
    }
  },
  
  createInvoice: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await invoiceAPI.create(data);
      
      if (result.error) throw new Error(result.error);
      
      if (result.data) {
        set((state) => ({
          invoices: [result.data, ...state.invoices],
          totalCount: state.totalCount + 1,
          draftInvoice: null,
          isLoading: false
        }));
        localStorage.removeItem('ruzma_draft_invoice');
      }
      
      return { data: result.data };
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  updateInvoice: async (id, data) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await invoiceAPI.update(id, data);
      
      if (result.error) throw new Error(result.error);
      
      if (result.data) {
        set((state) => ({
          invoices: state.invoices.map(i => 
            i.id === id ? result.data! : i
          ),
          currentInvoice: state.currentInvoice?.id === id 
            ? result.data 
            : state.currentInvoice,
          isLoading: false
        }));
      }
      
      return {};
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  deleteInvoice: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await invoiceAPI.delete(id);
      
      if (result.error) throw new Error(result.error);
      
      set((state) => ({
        invoices: state.invoices.filter(i => i.id !== id),
        currentInvoice: state.currentInvoice?.id === id 
          ? null 
          : state.currentInvoice,
        totalCount: state.totalCount - 1,
        isLoading: false
      }));
      
      return {};
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  sendInvoice: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await invoiceAPI.update(id, { status: 'sent' });
      
      if (result.error) throw new Error(result.error);
      
      if (result.data) {
        set((state) => ({
          invoices: state.invoices.map(i => 
            i.id === id ? { ...i, status: 'sent' } : i
          ),
          isLoading: false
        }));
      }
      
      return {};
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  markAsPaid: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await invoiceAPI.update(id, { status: 'paid' });
      
      if (result.error) throw new Error(result.error);
      
      if (result.data) {
        set((state) => ({
          invoices: state.invoices.map(i => 
            i.id === id ? { ...i, status: 'paid' } : i
          ),
          isLoading: false
        }));
      }
      
      return {};
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  generateInvoiceNumber: async () => {
    const { invoices } = get();
    const year = new Date().getFullYear();
    const count = invoices.filter(i => 
      i.invoice_number.startsWith(`INV-${year}`)
    ).length;
    
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  
  // Computed values
  getInvoiceById: (id) => {
    return get().invoices.find(i => i.id === id);
  },
  
  getInvoicesByStatus: (status) => {
    return get().invoices.filter(i => i.status === status);
  },
  
  getOverdueInvoices: () => {
    const today = new Date();
    return get().invoices.filter(i => {
      if (i.status === 'paid' || i.status === 'cancelled') return false;
      const dueDate = new Date(i.due_date);
      return dueDate < today;
    });
  },
  
  calculateTotal: (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }
});