import { useDataFetcher } from '@/hooks/core/useDataFetcher';
import { ClientService } from '@/services/domain/ClientService';
import { Client } from '@/types/client';
import { useAuth } from '@/components/AuthStateContext';
import { useCallback } from 'react';

export function useClients() {
  const { user } = useAuth();
  
  const fetchClients = useCallback(async () => {
    if (!user) return [];
    
    const service = new ClientService(user.id);
    return await service.findAllWithProjectCount();
  }, [user]);

  const {
    data: clients,
    loading,
    error,
    refetch
  } = useDataFetcher<(Client & { project_count: number })[]>({
    fetchFn: fetchClients,
    dependencies: [user?.id],
    initialData: [],
    requireAuth: true,
    cacheKey: user ? `clients-${user.id}` : undefined,
    cacheDuration: 10 * 60 * 1000 // 10 minutes
  });

  const createClient = useCallback(async (clientData: Partial<Client>) => {
    if (!user) return null;
    
    const service = new ClientService(user.id);
    const newClient = await service.create(clientData);
    
    if (newClient) {
      await refetch(); // Refresh the list
    }
    
    return newClient;
  }, [user, refetch]);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    if (!user) return null;
    
    const service = new ClientService(user.id);
    const updatedClient = await service.update(id, updates);
    
    if (updatedClient) {
      await refetch(); // Refresh the list
    }
    
    return updatedClient;
  }, [user, refetch]);

  const deleteClient = useCallback(async (id: string) => {
    if (!user) return false;
    
    const service = new ClientService(user.id);
    const success = await service.delete(id);
    
    if (success) {
      await refetch(); // Refresh the list
    }
    
    return success;
  }, [user, refetch]);

  const searchClients = useCallback(async (query: string) => {
    if (!user) return [];
    
    const service = new ClientService(user.id);
    return await service.search(query);
  }, [user]);

  return {
    clients: clients || [],
    loading,
    error,
    refetch,
    createClient,
    updateClient,
    deleteClient,
    searchClients
  };
}