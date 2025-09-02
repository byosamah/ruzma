
// Icons replaced with emojis
import { ClientWithProjectCount } from '@/types/client';
import { useT } from '@/lib/i18n';
import { StatCard } from '@/components/shared';

interface ClientsStatsProps {
  clients: ClientWithProjectCount[];
}

const ClientsStats = ({ clients }: ClientsStatsProps) => {
  const t = useT();

  const totalClients = clients.length;
  const totalProjects = clients.reduce((sum, client) => sum + client.project_count, 0);
  const averageProjectsPerClient = totalClients > 0 ? (totalProjects / totalClients).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <StatCard
        emoji="👥"
        title={t('totalClients')}
        value={totalClients}
      />

      <StatCard
        emoji="📂"
        title={t('totalProjects')}
        value={totalProjects}
      />

      <StatCard
        emoji="📊"
        title={t('avgProjectsPerClient')}
        value={averageProjectsPerClient}
      />
    </div>
  );
};

export default ClientsStats;
