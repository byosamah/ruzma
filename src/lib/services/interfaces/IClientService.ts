import { Client, ClientFormData } from '@/types/client';

export interface ClientFilters {
  search?: string;
  status?: 'active' | 'inactive' | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ClientListOptions extends ClientFilters {
  page?: number;
  limit?: number;
}

export interface ClientResult {
  data?: Client;
  error?: string;
}

export interface ClientListResult {
  data?: Client[];
  total?: number;
  error?: string;
}

export interface IClientService {
  // CRUD operations
  create(data: ClientFormData): Promise<ClientResult>;
  get(id: string): Promise<ClientResult>;
  list(options?: ClientListOptions): Promise<ClientListResult>;
  update(id: string, data: Partial<ClientFormData>): Promise<ClientResult>;
  delete(id: string): Promise<{ error?: string }>;
  
  // Client-specific operations
  getByEmail(email: string): Promise<ClientResult>;
  search(query: string): Promise<ClientListResult>;
  
  // Client projects
  getClientProjects(clientId: string): Promise<{
    data?: any[];
    error?: string;
  }>;
  
  // Statistics
  getStats(userId: string): Promise<{
    data?: {
      total: number;
      active: number;
      totalRevenue: number;
    };
    error?: string;
  }>;
}