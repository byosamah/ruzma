
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Icons replaced with emojis
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
    <div className="space-y-3 sm:space-y-4">
      <p className="text-slate-600 text-sm sm:text-xs line-clamp-2 leading-relaxed">
        {project.brief}
      </p>
      
      {(project.start_date || project.end_date) && (
        <div className="flex items-center gap-1.5 text-xs sm:text-xs text-slate-500">
          <span className="text-sm flex-shrink-0">📅</span>
          <span className="truncate">
            {project.start_date && formatDate(project.start_date)}
            {project.start_date && project.end_date && ' - '}
            {project.end_date && formatDate(project.end_date)}
          </span>
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-xs">
        <div className="flex items-center gap-1 text-slate-600">
          <span className="text-sm flex-shrink-0">⏰</span>
          <span className="whitespace-nowrap">{stats.completedMilestones}/{stats.totalMilestones} {t('milestones')}</span>
        </div>
        
        <div className="flex items-center gap-1 text-slate-600">
          <span className="text-sm flex-shrink-0">💰</span>
          <span className="whitespace-nowrap">{formatCurrency(stats.totalValue, currency)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs px-2 py-0.5 whitespace-nowrap">
          {stats.totalMilestones} {t('milestones')}
        </Badge>
        
        <div className="text-xs text-slate-400 truncate ml-2">
          {t('created')} {new Date(project.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ProjectCardContent;
