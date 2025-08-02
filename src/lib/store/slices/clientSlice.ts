import { StateCreator } from 'zustand';
import { ClientAPI } from '@/lib/api/clients';
import { Client, ClientFormData } from '@/types/client';

const clientAPI = new ClientAPI();

export interface ClientFilters {
  search: string;
  status: 'active' | 'inactive' | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ClientSlice {
  // State
  clients: Client[];
  currentClient: Client | null;
  filters: ClientFilters;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setClients: (clients: Client[]) => void;
  setCurrentClient: (client: Client | null) => void;
  setFilters: (filters: Partial<ClientFilters>) => void;
  resetFilters: () => void;
  
  // API operations
  fetchClients: (page?: number, pageSize?: number) => Promise<void>;
  fetchClient: (id: string) => Promise<void>;
  createClient: (data: ClientFormData) => Promise<{ data?: Client; error?: string }>;
  updateClient: (id: string, data: Partial<ClientFormData>) => Promise<{ error?: string }>;
  deleteClient: (id: string) => Promise<{ error?: string }>;
  
  // Computed values
  getClientById: (id: string) => Client | undefined;
  getActiveClients: () => Client[];
  getClientsWithProjects: () => Client[];
  searchClients: (query: string) => Client[];
}

const defaultFilters: ClientFilters = {
  search: '',
  status: null,
  sortBy: 'created_at',
  sortOrder: 'desc'
};

export const createClientSlice: StateCreator<ClientSlice> = (set, get) => ({
  // Initial state
  clients: [],
  currentClient: null,
  filters: defaultFilters,
  totalCount: 0,
  isLoading: false,
  error: null,
  
  // Actions
  setClients: (clients) => set({ clients }),
  
  setCurrentClient: (currentClient) => set({ currentClient }),
  
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  // API operations
  fetchClients: async (page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    
    try {
      const { filters } = get();
      const result = await clientAPI.list({
        page,
        limit: pageSize,
        search: filters.search,
        status: filters.status,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder
      });
      
      if (result.error) throw new Error(result.error);
      
      set({
        clients: result.data || [],
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
  
  fetchClient: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await clientAPI.get(id);
      
      if (result.error) throw new Error(result.error);
      
      set({
        currentClient: result.data || null,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },
  
  createClient: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await clientAPI.create(data);
      
      if (result.error) throw new Error(result.error);
      
      if (result.data) {
        set((state) => ({
          clients: [result.data, ...state.clients],
          totalCount: state.totalCount + 1,
          isLoading: false
        }));
      }
      
      return { data: result.data };
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  updateClient: async (id, data) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await clientAPI.update(id, data);
      
      if (result.error) throw new Error(result.error);
      
      if (result.data) {
        set((state) => ({
          clients: state.clients.map(c => 
            c.id === id ? result.data! : c
          ),
          currentClient: state.currentClient?.id === id 
            ? result.data 
            : state.currentClient,
          isLoading: false
        }));
      }
      
      return {};
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  deleteClient: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await clientAPI.delete(id);
      
      if (result.error) throw new Error(result.error);
      
      set((state) => ({
        clients: state.clients.filter(c => c.id !== id),
        currentClient: state.currentClient?.id === id 
          ? null 
          : state.currentClient,
        totalCount: state.totalCount - 1,
        isLoading: false
      }));
      
      return {};
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return { error: error.message };
    }
  },
  
  // Computed values
  getClientById: (id) => {
    return get().clients.find(c => c.id === id);
  },
  
  getActiveClients: () => {
    return get().clients.filter(c => 
      c.projects?.some(p => p.status === 'active')
    );
  },
  
  getClientsWithProjects: () => {
    return get().clients.filter(c => 
      c.projects && c.projects.length > 0
    );
  },
  
  searchClients: (query) => {
    if (!query) return get().clients;
    
    const lowerQuery = query.toLowerCase();
    return get().clients.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery) ||
      c.company?.toLowerCase().includes(lowerQuery)
    );
  }
});