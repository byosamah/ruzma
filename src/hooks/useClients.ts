
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { DatabaseClient, ClientWithProjectCount, CreateClientData, UpdateClientData } from '@/types/client';
import { securityMonitor } from '@/lib/securityMonitoring';
import { validateEmail, sanitizeInput } from '@/lib/inputValidation';

export const useClients = (user: User | null) => {
  const [clients, setClients] = useState<ClientWithProjectCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Monitor data access
      securityMonitor.monitorDataAccess('clients', 'fetch_all', { userId: user.id });
      
      // First fetch all clients for the user
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        securityMonitor.monitorPermissionViolation('clients', 'fetch', {
          error: clientsError.message,
          userId: user.id
        });
        toast.error('Failed to load clients');
        return;
      }

      // Then fetch project counts for each client
      const clientsWithCount: ClientWithProjectCount[] = [];
      
      for (const client of clientsData || []) {
        const { count, error: countError } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('user_id', user.id);

        if (countError) {
          console.error('Error counting projects for client:', client.id, countError);
          clientsWithCount.push({
            ...client,
            project_count: 0
          });
        } else {
          clientsWithCount.push({
            ...client,
            project_count: count || 0
          });
        }
      }

      setClients(clientsWithCount);
    } catch (error) {
      console.error('Error:', error);
      securityMonitor.logEvent('suspicious_activity', {
        activity: 'client_fetch_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id
      });
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: CreateClientData): Promise<boolean> => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    // Enhanced input validation
    const emailValidation = validateEmail(clientData.email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error || 'Invalid email');
      securityMonitor.monitorValidationFailure(clientData.email, 'email_validation');
      return false;
    }

    const sanitizedName = sanitizeInput(clientData.name);
    if (sanitizedName !== clientData.name) {
      securityMonitor.monitorValidationFailure(clientData.name, 'name_sanitization');
    }

    // Rate limiting check
    const rateLimitKey = `create_client_${user.id}`;
    if (!securityMonitor.checkRateLimit(rateLimitKey, 10, 60000)) { // 10 attempts per minute
      toast.error('Too many attempts. Please try again later.');
      return false;
    }

    try {
      securityMonitor.monitorDataModification('clients', 'create', { userId: user.id });

      const { error } = await supabase
        .from('clients')
        .insert([{
          name: sanitizedName,
          email: clientData.email,
          user_id: user.id
        }]);

      if (error) {
        console.error('Error creating client:', error);
        if (error.code === '23505') {
          toast.error('A client with this email already exists');
        } else {
          securityMonitor.monitorPermissionViolation('clients', 'create', {
            error: error.message,
            userId: user.id
          });
          toast.error('Failed to create client');
        }
        return false;
      }

      toast.success('Client created successfully');
      await fetchClients();
      return true;
    } catch (error) {
      console.error('Error:', error);
      securityMonitor.logEvent('suspicious_activity', {
        activity: 'client_creation_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id
      });
      toast.error('Failed to create client');
      return false;
    }
  };

  const updateClient = async (clientId: string, clientData: UpdateClientData): Promise<boolean> => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    // Enhanced input validation
    if (clientData.email) {
      const emailValidation = validateEmail(clientData.email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.error || 'Invalid email');
        securityMonitor.monitorValidationFailure(clientData.email, 'email_validation');
        return false;
      }
    }

    if (clientData.name) {
      const sanitizedName = sanitizeInput(clientData.name);
      if (sanitizedName !== clientData.name) {
        securityMonitor.monitorValidationFailure(clientData.name, 'name_sanitization');
        clientData.name = sanitizedName;
      }
    }

    try {
      securityMonitor.monitorDataModification('clients', 'update', { 
        clientId, 
        userId: user.id 
      });

      const { error } = await supabase
        .from('clients')
        .update({
          ...clientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating client:', error);
        if (error.code === '23505') {
          toast.error('A client with this email already exists');
        } else {
          securityMonitor.monitorPermissionViolation('clients', 'update', {
            error: error.message,
            clientId,
            userId: user.id
          });
          toast.error('Failed to update client');
        }
        return false;
      }

      toast.success('Client updated successfully');
      await fetchClients();
      return true;
    } catch (error) {
      console.error('Error:', error);
      securityMonitor.logEvent('suspicious_activity', {
        activity: 'client_update_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        clientId,
        userId: user.id
      });
      toast.error('Failed to update client');
      return false;
    }
  };

  const deleteClient = async (clientId: string): Promise<boolean> => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    try {
      securityMonitor.monitorDataModification('clients', 'delete', { 
        clientId, 
        userId: user.id 
      });

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting client:', error);
        securityMonitor.monitorPermissionViolation('clients', 'delete', {
          error: error.message,
          clientId,
          userId: user.id
        });
        toast.error('Failed to delete client');
        return false;
      }

      toast.success('Client deleted successfully');
      await fetchClients();
      return true;
    } catch (error) {
      console.error('Error:', error);
      securityMonitor.logEvent('suspicious_activity', {
        activity: 'client_deletion_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        clientId,
        userId: user.id
      });
      toast.error('Failed to delete client');
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  return {
    clients,
    loading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  };
};
