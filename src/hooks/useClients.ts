
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
      
      // First fetch all clients for the user
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
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
