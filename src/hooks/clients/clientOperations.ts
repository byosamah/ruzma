
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { DatabaseClient, ClientWithProjectCount, CreateClientData, UpdateClientData } from '@/types/client';
import { securityMonitor } from '@/lib/securityMonitoring';
import { validateClientData, checkRateLimit } from './clientValidation';

export const fetchClientsData = async (user: User | null): Promise<ClientWithProjectCount[]> => {
  if (!user) return [];

  try {
    // Monitor data access
    securityMonitor.monitorDataAccess('clients', 'fetch_all', { userId: user.id });
    
    // First fetch all clients for the user
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (clientsError) {
      securityMonitor.monitorPermissionViolation('clients', 'fetch', {
        error: clientsError.message,
        userId: user.id
      });
      toast.error('Failed to load clients');
      return [];
    }

    // Optimize project count fetching with a single query
    const { data: projectCountData, error: countError } = await supabase
      .from('projects')
      .select('client_id')
      .eq('user_id', user.id)
      .in('client_id', (clientsData || []).map(c => c.id));

    if (countError) {
      // Count errors are not critical, continue with zero counts
    }

    // Create a map of client_id to project count
    const projectCounts = new Map<string, number>();
    if (projectCountData) {
      projectCountData.forEach(project => {
        const count = projectCounts.get(project.client_id) || 0;
        projectCounts.set(project.client_id, count + 1);
      });
    }

    // Map clients with their project counts
    const clientsWithCount: ClientWithProjectCount[] = (clientsData || []).map(client => ({
      ...client,
      project_count: projectCounts.get(client.id) || 0
    }));

    return clientsWithCount;
  } catch (error) {
    securityMonitor.logEvent('suspicious_activity', {
      activity: 'client_fetch_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id
    });
    toast.error('Failed to load clients');
    return [];
  }
};

export const createClientData = async (user: User, clientData: CreateClientData): Promise<boolean> => {
  // Enhanced input validation
  const validation = validateClientData(clientData, user.id);
  if (!validation.isValid) return false;

  // Rate limiting check
  if (!checkRateLimit(user.id)) return false;

  try {
    securityMonitor.monitorDataModification('clients', 'create', { userId: user.id });

    const { error } = await supabase
      .from('clients')
      .insert([{
        name: validation.sanitizedData?.name || clientData.name,
        email: clientData.email,
        user_id: user.id
      }]);

    if (error) {
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
    return true;
  } catch (error) {
    securityMonitor.logEvent('suspicious_activity', {
      activity: 'client_creation_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id
    });
    toast.error('Failed to create client');
    return false;
  }
};

export const updateClientData = async (user: User, clientId: string, clientData: UpdateClientData): Promise<boolean> => {
  // Enhanced input validation
  const validation = validateClientData(clientData, user.id);
  if (!validation.isValid) return false;

  try {
    securityMonitor.monitorDataModification('clients', 'update', { 
      clientId, 
      userId: user.id 
    });

    const { error } = await supabase
      .from('clients')
      .update({
        ...validation.sanitizedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .eq('user_id', user.id);

    if (error) {
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
    return true;
  } catch (error) {
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

export const deleteClientData = async (user: User, clientId: string): Promise<boolean> => {
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
      securityMonitor.monitorPermissionViolation('clients', 'delete', {
        error: error.message,
        clientId,
        userId: user.id
      });
      toast.error('Failed to delete client');
      return false;
    }

    toast.success('Client deleted successfully');
    return true;
  } catch (error) {
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
