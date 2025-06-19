
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
    <div className="space-y-5">
      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">{project.brief}</p>
      
      <div className="bg-slate-50 rounded-lg p-4">
        <div className={`grid ${isVerticalLayout ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Total Value</p>
              <p className="text-sm font-semibold text-slate-800">{formatCurrency(totalValue, currency)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Created</p>
              <p className="text-sm font-medium text-slate-700">{formatProjectDate(project.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-green-100 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-600" />
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
        
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="text-sm font-bold text-slate-700">
            {totalMilestones > 0 ? Math.round(completedMilestones / totalMilestones * 100) : 0}%
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Milestones</p>
        <div className="flex flex-wrap gap-2">
          {project.milestones.slice(0, 3).map(milestone => (
            <Badge 
              key={milestone.id} 
              variant="secondary" 
              className={`text-xs px-3 py-1 ${getStatusColor(milestone.status)} text-white font-medium`}
            >
              {milestone.title}
            </Badge>
          ))}
          {project.milestones.length > 3 && (
            <Badge variant="outline" className="text-xs px-3 py-1 border-dashed">
              +{project.milestones.length - 3} More
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCardContent;
