
import React from 'react';
import { Users, Mail, FolderOpen } from 'lucide-react';
import { ClientWithProjectCount } from '@/types/client';
import { useT } from '@/lib/i18n';

interface ClientsStatsProps {
  clients: ClientWithProjectCount[];
}

const ClientsStats: React.FC<ClientsStatsProps> = ({ clients }) => {
  const t = useT();

  const totalClients = clients.length;
  const totalProjects = clients.reduce((sum, client) => sum + client.project_count, 0);
  const averageProjectsPerClient = totalClients > 0 ? (totalProjects / totalClients).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
            <Users className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t('totalClients')}</p>
            <p className="text-xl font-medium text-gray-900">{totalClients}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t('totalProjects')}</p>
            <p className="text-xl font-medium text-gray-900">{totalProjects}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-100/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
            <Mail className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t('avgProjectsPerClient')}</p>
            <p className="text-xl font-medium text-gray-900">{averageProjectsPerClient}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsStats;
