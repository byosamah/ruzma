
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
    <div className="space-y-2.5">
      <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{project.brief}</p>
      
      <div className="bg-slate-50 rounded-md p-2.5">
        <div className={`grid ${isVerticalLayout ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-2.5'}`}>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-green-100 rounded-full">
              <DollarSign className="w-3 h-3 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Value</p>
              <p className="text-sm font-semibold text-slate-800">{formatCurrency(totalValue, currency)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-100 rounded-full">
              <Calendar className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Created</p>
              <p className="text-sm font-medium text-slate-700">{formatProjectDate(project.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-green-100 rounded-full">
            <CheckCircle className="w-3 h-3 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              {completedMilestones}/{totalMilestones} Milestones
            </p>
            <p className="text-xs text-slate-500">
              {totalMilestones > 0 ? Math.round(completedMilestones / totalMilestones * 100) : 0}% Complete
            </p>
          </div>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-700">
            {totalMilestones > 0 ? Math.round(completedMilestones / totalMilestones * 100) : 0}%
          </span>
        </div>
      </div>

      <div className="border-t pt-2.5">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5 font-medium">Milestones</p>
        <div className="flex flex-wrap gap-1">
          {project.milestones.slice(0, 3).map(milestone => (
            <Badge 
              key={milestone.id} 
              variant="secondary" 
              className={`text-xs px-1.5 py-0.5 ${getStatusColor(milestone.status)} text-white font-medium`}
            >
              {milestone.title}
            </Badge>
          ))}
          {project.milestones.length > 3 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-dashed">
              +{project.milestones.length - 3} More
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCardContent;
