
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Coins } from 'lucide-react';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { DatabaseProject } from '@/hooks/projectTypes';
import { ProjectStats } from './types';
import { useT } from '@/lib/i18n';
import { memo } from 'react';

interface ProjectCardContentProps {
  project: DatabaseProject;
  stats: ProjectStats;
  currency: CurrencyCode;
  convertFrom?: CurrencyCode;
  isVerticalLayout: boolean;
}

function ProjectCardContent({ 
  project, 
  stats, 
  currency,
  convertFrom, 
  isVerticalLayout 
}: ProjectCardContentProps) {
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
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {project.start_date && formatDate(project.start_date)}
            {project.start_date && project.end_date && ' - '}
            {project.end_date && formatDate(project.end_date)}
          </span>
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-xs">
        <div className="flex items-center gap-1 text-slate-600">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="whitespace-nowrap">{stats.completedMilestones}/{stats.totalMilestones} {t('milestones')}</span>
        </div>
        
        <div className="flex items-center gap-1 text-slate-600">
          <Coins className="w-3 h-3 flex-shrink-0" />
          <span className="whitespace-nowrap">
            {convertFrom && convertFrom !== currency ? (
              <CurrencyDisplay
                amount={stats.totalValue}
                fromCurrency={convertFrom}
                toCurrency={currency}
                showConversionIndicator={true}
                className="text-xs"
              />
            ) : (
              formatCurrency(stats.totalValue, currency)
            )}
          </span>
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
}

export default memo(ProjectCardContent);
