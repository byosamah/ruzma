
import React, { useState, useMemo } from 'react';
import { ClientWithProjectCount } from '@/types/client';
import { useT } from '@/lib/i18n';
import ClientFilters from './ClientFilters';
import ClientTable from './ClientTable';

interface ClientsSectionProps {
  clients: ClientWithProjectCount[];
  onEdit: (client: ClientWithProjectCount) => void;
  onDelete: (client: ClientWithProjectCount) => void;
  onViewDetails: (client: ClientWithProjectCount) => void;
  onAddClient: () => void;
}

const ClientsSection: React.FC<ClientsSectionProps> = ({
  clients,
  onEdit,
  onDelete,
  onViewDetails,
  onAddClient
}) => {
  const t = useT();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">{t('allClients')}</h2>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200/60">
        <div className="p-4 border-b border-gray-100">
          <ClientFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddClient={onAddClient}
          />
        </div>
        
        <div className="p-4">
          <ClientTable
            clients={filteredClients}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientsSection;
