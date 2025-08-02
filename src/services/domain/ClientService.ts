import { BaseService } from '@/services/core/BaseService';
import { ErrorHandler } from '@/services/core/ErrorHandler';
import { Client } from '@/types/client';
import { supabase } from '@/integrations/supabase/client';
import { validators } from '@/lib/utils/validation';

export class ClientService extends BaseService<Client> {
  constructor(userId: string) {
    super({
      tableName: 'clients',
      displayName: 'Client',
      userId
    });
  }

  // Override create to add email validation and duplication check
  async create(payload: Partial<Client>): Promise<Client | null> {
    try {
      // Validate email
      if (payload.email && !validators.isEmail(payload.email)) {
        throw new Error('Invalid email address');
      }

      // Sanitize email
      if (payload.email) {
        payload.email = validators.sanitizeEmail(payload.email);
      }

      // Check for duplicate
      const exists = await this.exists({ email: payload.email });
      if (exists) {
        throw new Error('A client with this email already exists');
      }

      // Use base create method
      return await super.create(payload);
    } catch (error) {
      ErrorHandler.handle(error, 'ClientService.create');
      return null;
    }
  }

  // Custom method to find by email
  async findByEmail(email: string): Promise<Client | null> {
    try {
      const sanitizedEmail = validators.sanitizeEmail(email);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('email', sanitizedEmail)
        .eq('user_id', this.userId!)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      ErrorHandler.handle(error, 'ClientService.findByEmail', {
        showToast: false
      });
      return null;
    }
  }

  // Get clients with project count
  async findAllWithProjectCount(): Promise<(Client & { project_count: number })[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects!projects_client_id_fkey(count)
        `)
        .eq('user_id', this.userId!)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(client => ({
        ...client,
        project_count: client.projects?.[0]?.count || 0
      }));
    } catch (error) {
      ErrorHandler.handle(error, 'ClientService.findAllWithProjectCount');
      return [];
    }
  }

  // Batch create clients
  async createBatch(clients: Partial<Client>[]): Promise<Client[]> {
    try {
      const validClients = [];
      
      for (const client of clients) {
        if (client.email && validators.isEmail(client.email)) {
          validClients.push({
            ...client,
            email: validators.sanitizeEmail(client.email),
            user_id: this.userId
          });
        }
      }

      if (validClients.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(validClients)
        .select();

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      ErrorHandler.handle(error, 'ClientService.createBatch');
      return [];
    }
  }

  // Search clients by name or email
  async search(query: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', this.userId!)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      ErrorHandler.handle(error, 'ClientService.search');
      return [];
    }
  }
}