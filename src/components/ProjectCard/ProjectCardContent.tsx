
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { DatabaseProject } from '@/hooks/projectTypes';
import { ProjectStats } from './types';
import { getStatusColor, formatProjectDate } from './utils';

interface ProjectCardContentProps {
  project: DatabaseProject;
  stats: ProjectStats;
  currency: CurrencyCode;
  isVerticalLayout?: boolean;
}

const ProjectCardContent: React.FC<ProjectCardContentProps> = ({
  project,
  stats,
  currency,
  isVerticalLayout = false
}) => {
  const { totalValue, completedMilestones, totalMilestones } = stats;

  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm line-clamp-3">{project.brief}</p>
      
      <div className={`grid grid-cols-2 ${isVerticalLayout ? 'gap-4' : 'gap-20 mx-px'}`}>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">{formatCurrency(totalValue, currency)}</span>
        </div>
        <div className={`flex items-center gap-2 ${isVerticalLayout ? '' : 'mx-0'}`}>
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-slate-600">
            {formatProjectDate(project.created_at)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm">
            {completedMilestones}/{totalMilestones} Milestones
          </span>
        </div>
        <div className={`text-sm text-slate-500 ${isVerticalLayout ? '' : 'px-[21px]'}`}>
          {totalMilestones > 0 ? Math.round(completedMilestones / totalMilestones * 100) : 0}% Complete
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.milestones.slice(0, 3).map(milestone => (
          <Badge key={milestone.id} variant="secondary" className={`text-xs ${getStatusColor(milestone.status)} text-white`}>
            {milestone.title}
          </Badge>
        ))}
        {project.milestones.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{project.milestones.length - 3} More
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ProjectCardContent;
