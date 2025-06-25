
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { DatabaseClient, ClientWithProjectCount, CreateClientData, UpdateClientData } from '@/types/client';

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
      
      // Fetch clients with proper project count using a subquery
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select(`
          *,
          project_count:projects!client_id(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
        return;
      }

      // Transform the data to match our expected format
      const clientsWithCount = (clientsData || []).map(client => ({
        ...client,
        project_count: client.project_count?.[0]?.count || 0
      })) as ClientWithProjectCount[];

      setClients(clientsWithCount);
    } catch (error) {
      console.error('Error:', error);
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

    try {
      const { error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          user_id: user.id
        }]);

      if (error) {
        console.error('Error creating client:', error);
        if (error.code === '23505') {
          toast.error('A client with this email already exists');
        } else {
          toast.error('Failed to create client');
        }
        return false;
      }

      toast.success('Client created successfully');
      await fetchClients();
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create client');
      return false;
    }
  };

  const updateClient = async (clientId: string, clientData: UpdateClientData): Promise<boolean> => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    try {
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
          toast.error('Failed to update client');
        }
        return false;
      }

      toast.success('Client updated successfully');
      await fetchClients();
      return true;
    } catch (error) {
      console.error('Error:', error);
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
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
        return false;
      }

      toast.success('Client deleted successfully');
      await fetchClients();
      return true;
    } catch (error) {
      console.error('Error:', error);
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
