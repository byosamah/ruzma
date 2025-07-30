
import React from 'react';
import { Users, Mail, FolderOpen } from 'lucide-react';
import { ClientWithProjectCount } from '@/types/client';
import { useT } from '@/lib/i18n';
import { StatCard } from '@/components/shared';

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
      <StatCard
        icon={Users}
        title={t('totalClients')}
        value={totalClients}
      />

      <StatCard
        icon={FolderOpen}
        title={t('totalProjects')}
        value={totalProjects}
      />

      <StatCard
        icon={Mail}
        title={t('avgProjectsPerClient')}
        value={averageProjectsPerClient}
      />
    </div>
  );
};

export default ClientsStats;
