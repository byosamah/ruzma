
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { useUpcomingDeadlines } from '@/hooks/useUpcomingDeadlines';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useT } from '@/lib/i18n';

interface UpcomingDeadlinesProps {
  projects: DatabaseProject[];
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ projects }) => {
  const t = useT();
  const { navigate } = useLanguageNavigation();
  const { stats } = useUpcomingDeadlines(projects);

  const getDisplayContent = () => {
    if (stats.total === 0) {
      return {
        icon: CheckCircle,
        iconColor: 'text-green-600',
        title: t('noUpcomingDeadlines'),
        subtitle: t('allProjectsOnTrack'),
      };
    }

    if (stats.overdue > 0) {
      return {
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        title: `${stats.overdue} ${t('overdue')}`,
        subtitle: t('needsAttention'),
      };
    }

    if (stats.dueSoon > 0) {
      return {
        icon: Clock,
        iconColor: 'text-amber-600',
        title: `${stats.dueSoon} ${t('dueSoon')}`,
        subtitle: t('within7Days'),
      };
    }

    if (stats.nextDeadline) {
      const daysText = stats.nextDeadline.daysRemaining === 1 ? t('tomorrow') : `${stats.nextDeadline.daysRemaining} ${t('daysLeft')}`;
      return {
        icon: Calendar,
        iconColor: 'text-blue-600',
        title: daysText,
        subtitle: stats.nextDeadline.projectName,
      };
    }

    return {
      icon: Calendar,
      iconColor: 'text-gray-400',
      title: t('noDeadlines'),
      subtitle: t('noProjectDeadlines'),
    };
  };

  const content = getDisplayContent();
  const Icon = content.icon;

  return (
    <Card className="border-0 shadow-none bg-gray-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{t('upcomingDeadlines')}</CardTitle>
        <Calendar className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white">
                <Icon className={`w-4 h-4 ${content.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium text-gray-900 truncate">{content.title}</p>
                <p className="text-xs text-gray-500 truncate">{content.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
