
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { DatabaseProject } from '@/hooks/projectTypes';
import { ProjectStats } from './types';
import { useT } from '@/lib/i18n';

interface ProjectCardContentProps {
  project: DatabaseProject;
  stats: ProjectStats;
  currency: CurrencyCode;
  isVerticalLayout: boolean;
}

const ProjectCardContent: React.FC<ProjectCardContentProps> = ({ 
  project, 
  stats, 
  currency, 
  isVerticalLayout 
}) => {
  const t = useT();

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {project.brief && (
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {project.brief}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{stats.completedMilestones}/{stats.totalMilestones} {t('milestones')}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5" />
          <span className="font-medium">{formatCurrency(stats.totalValue, currency)}</span>
        </div>

        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {project.start_date && formatDate(project.start_date)}
              {project.start_date && project.end_date && ' - '}
              {project.end_date && formatDate(project.end_date)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-gray-50 text-gray-600 border-0 font-normal">
          {stats.totalMilestones} {t('milestones')}
        </Badge>
        
        <span className="text-xs text-gray-400">
          {t('created')} {new Date(project.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default ProjectCardContent;
