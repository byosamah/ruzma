
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { ClientWithProjectCount, CreateClientData, UpdateClientData } from '@/types/client';
import { fetchClientsData, createClientData, updateClientData, deleteClientData } from './clientOperations';

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
      const clientsData = await fetchClientsData(user);
      setClients(clientsData);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: CreateClientData): Promise<boolean> => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    const success = await createClientData(user, clientData);
    if (success) {
      await fetchClients();
    }
    return success;
  };

  const updateClient = async (clientId: string, clientData: UpdateClientData): Promise<boolean> => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    const success = await updateClientData(user, clientId, clientData);
    if (success) {
      await fetchClients();
    }
    return success;
  };

  const deleteClient = async (clientId: string): Promise<boolean> => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    const success = await deleteClientData(user, clientId);
    if (success) {
      await fetchClients();
    }
    return success;
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
