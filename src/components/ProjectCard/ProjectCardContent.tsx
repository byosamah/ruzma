
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
    <CardContent className="p-6">
      <div className="space-y-4">
        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
          {project.brief}
        </p>
        
        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>
              {project.start_date && formatDate(project.start_date)}
              {project.start_date && project.end_date && ' - '}
              {project.end_date && formatDate(project.end_date)}
            </span>
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{stats.completedMilestones}/{stats.totalMilestones} {t('milestones_plural')}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-slate-600">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(stats.totalValue, currency)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {stats.totalMilestones} {t('milestones_plural')}
          </Badge>
          
          <div className="text-xs text-slate-500">
            {t('created')} {new Date(project.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </CardContent>
  );
};

export default ProjectCardContent;
