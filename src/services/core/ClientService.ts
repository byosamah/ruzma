import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';

export interface Client {
  id: string;
  name: string;
  email: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export class ClientService extends BaseService {
  constructor(user: User | null) {
    super(user);
  }

  async findOrCreateClient(clientEmail: string, clientName?: string): Promise<Client> {
    const user = this.ensureAuthenticated();

    try {
      // First, try to find existing client
      const { data: existingClient, error: findError } = await this.supabase
        .from('clients')
        .select('*')
        .eq('email', clientEmail)
        .eq('user_id', user.id)
        .maybeSingle();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existingClient) {
        this.logOperation('client_found', { clientId: existingClient.id });
        return existingClient;
      }

      // Create new client if not found
      const newClientData = {
        name: clientName || clientEmail.split('@')[0],
        email: clientEmail,
        user_id: user.id
      };

      const { data: newClient, error: createError } = await this.supabase
        .from('clients')
        .insert(newClientData)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      this.logOperation('client_created', { clientId: newClient.id });
      return newClient;
    } catch (error) {
      return this.handleError(error, 'findOrCreateClient');
    }
  }

  async getClientById(clientId: string): Promise<Client | null> {
    const user = this.ensureAuthenticated();

    try {
      const { data: client, error } = await this.supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return client;
    } catch (error) {
      return this.handleError(error, 'getClientById');
    }
  }

  async validateClientEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}