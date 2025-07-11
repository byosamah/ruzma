import React from 'react';
import { DollarSign, Calendar, Users } from 'lucide-react';
import { DatabaseProject } from '@/types/shared';
import { formatCurrency } from '@/lib/currency';
import { CurrencyCode } from '@/lib/currency';

interface ProjectStatsProps {
  project: DatabaseProject;
  isMobile: boolean;
  userCurrency: CurrencyCode;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({
  project,
  isMobile,
  userCurrency
}) => {
  // Calculate project stats
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalMilestones = project.milestones.length;

  if (isMobile) {
    return <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/60 rounded-xl p-4 text-center border border-white/40">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-lg font-bold text-slate-800">{formatCurrency(totalValue, userCurrency)}</div>
          <div className="text-xs text-slate-600">Total Value</div>
        </div>
        <div className="bg-white/60 rounded-xl p-4 text-center border border-white/40">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-800">{completedMilestones}/{totalMilestones}</div>
          <div className="text-xs text-slate-600">Progress</div>
        </div>
        <div className="bg-white/60 rounded-xl p-4 text-center border border-white/40">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-slate-800">{totalMilestones > 0 ? Math.round(completedMilestones / totalMilestones * 100) : 0}%</div>
          <div className="text-xs text-slate-600">Complete</div>
        </div>
      </div>;
  }

  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      
      
      
      
    </div>;
};

export default ProjectStats;
