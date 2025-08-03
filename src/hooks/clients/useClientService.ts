import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { ClientWithProjectCount, CreateClientData, UpdateClientData } from '@/types/client';
import { ServiceRegistry } from '@/services/core/ServiceRegistry';

export const useClientService = (user: User | null) => {
  const [clients, setClients] = useState<ClientWithProjectCount[]>([]);
  const [loading, setLoading] = useState(true);

  const clientService = ServiceRegistry.getInstance().getClientService(user);

  const fetchClients = useCallback(async () => {
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const clientsData = await clientService.getAllClients();
      setClients(clientsData);
    } finally {
      setLoading(false);
    }
  }, [user, clientService]);

  const createClient = useCallback(async (clientData: CreateClientData): Promise<boolean> => {
    if (!user) return false;

    const newClient = await clientService.createClient(clientData);
    if (newClient) {
      await fetchClients();
      return true;
    }
    return false;
  }, [user, clientService, fetchClients]);

  const updateClient = useCallback(async (clientId: string, clientData: UpdateClientData): Promise<boolean> => {
    if (!user) return false;

    const updatedClient = await clientService.updateClient(clientId, clientData);
    if (updatedClient) {
      await fetchClients();
      return true;
    }
    return false;
  }, [user, clientService, fetchClients]);

  const deleteClient = useCallback(async (clientId: string): Promise<boolean> => {
    if (!user) return false;

    const success = await clientService.deleteClient(clientId);
    if (success) {
      await fetchClients();
    }
    return success;
  }, [user, clientService, fetchClients]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  };
};