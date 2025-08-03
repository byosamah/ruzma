import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { ClientWithProjectCount, CreateClientData, UpdateClientData } from '@/types/client';
import { validateEmail, sanitizeInput } from '@/lib/inputValidation';
import { securityMonitor } from '@/lib/securityMonitoring';
import { toast } from 'sonner';

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

  async getAllClients(): Promise<ClientWithProjectCount[]> {
    const user = this.ensureAuthenticated();

    try {
      securityMonitor.monitorDataAccess('clients', 'fetch_all');

      const { data: clients, error } = await this.supabase
        .from('clients')
        .select('*, projects(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const clientsWithCount = clients?.map(client => ({
        ...client,
        project_count: Array.isArray(client.projects) ? client.projects.length : 0
      })) || [];

      this.logOperation('clients_fetched', { count: clientsWithCount.length });
      return clientsWithCount;
    } catch (error) {
      return this.handleError(error, 'getAllClients');
    }
  }

  async createClient(clientData: CreateClientData): Promise<Client | null> {
    const user = this.ensureAuthenticated();

    try {
      // Rate limiting check
      const rateLimitKey = `create_client_${user.id}`;
      if (!securityMonitor.checkRateLimit(rateLimitKey, 10, 60000)) {
        toast.error('Too many attempts. Please try again later.');
        return null;
      }

      // Validate input
      const validationResult = this.validateClientData(clientData, user.id);
      if (!validationResult.isValid) {
        return null;
      }

      const sanitizedData = validationResult.sanitizedData;

      securityMonitor.monitorDataModification('clients', 'create', { email: sanitizedData.email });

      const { data: newClient, error } = await this.supabase
        .from('clients')
        .insert({
          name: sanitizedData.name,
          email: sanitizedData.email,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('A client with this email already exists');
          return null;
        }
        throw error;
      }

      this.logOperation('client_created', { clientId: newClient.id });
      toast.success('Client created successfully');
      return newClient;
    } catch (error) {
      return this.handleError(error, 'createClient');
    }
  }

  async updateClient(clientId: string, clientData: UpdateClientData): Promise<Client | null> {
    const user = this.ensureAuthenticated();

    try {
      // Validate input
      const validationResult = this.validateClientData(clientData, user.id);
      if (!validationResult.isValid) {
        return null;
      }

      const sanitizedData = validationResult.sanitizedData;

      securityMonitor.monitorDataModification('clients', 'update', { clientId });

      const { data: updatedClient, error } = await this.supabase
        .from('clients')
        .update(sanitizedData)
        .eq('id', clientId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('A client with this email already exists');
          return null;
        }
        throw error;
      }

      this.logOperation('client_updated', { clientId });
      toast.success('Client updated successfully');
      return updatedClient;
    } catch (error) {
      return this.handleError(error, 'updateClient');
    }
  }

  async deleteClient(clientId: string): Promise<boolean> {
    const user = this.ensureAuthenticated();

    try {
      securityMonitor.monitorDataModification('clients', 'delete', { clientId });

      const { error } = await this.supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      this.logOperation('client_deleted', { clientId });
      toast.success('Client deleted successfully');
      return true;
    } catch (error) {
      this.handleError(error, 'deleteClient');
      return false;
    }
  }

  private validateClientData(clientData: CreateClientData | UpdateClientData, userId: string) {
    if ('email' in clientData && clientData.email) {
      const emailValidation = validateEmail(clientData.email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.error || 'Invalid email');
        securityMonitor.monitorValidationFailure(clientData.email, 'email_validation');
        return { isValid: false };
      }
    }

    if ('name' in clientData && clientData.name) {
      const sanitizedName = sanitizeInput(clientData.name);
      if (sanitizedName !== clientData.name) {
        securityMonitor.monitorValidationFailure(clientData.name, 'name_sanitization');
        return { isValid: true, sanitizedData: { ...clientData, name: sanitizedName } };
      }
    }

    return { isValid: true, sanitizedData: clientData };
  }
}