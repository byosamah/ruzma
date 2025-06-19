
import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { formatCurrency } from '@/lib/currency';
import { CurrencyCode } from '@/lib/currency';

interface ProjectStatsProps {
  project: DatabaseProject;
  isMobile: boolean;
  userCurrency: CurrencyCode;
}

const MoneyIcon = () => (
  <img src="/lovable-uploads/47dfcb8f-ab87-46b3-940f-e8f798b9fde1.png" alt="Money" className="w-4 h-4 sm:w-5 sm:h-5" />
);

const ProjectStats: React.FC<ProjectStatsProps> = ({ project, isMobile, userCurrency }) => {
  // Calculate project stats
  const totalValue = project.milestones.reduce((sum, m) => sum + m.price, 0);
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalMilestones = project.milestones.length;

  if (isMobile) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/60 rounded-xl p-4 text-center border border-white/40">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <MoneyIcon />
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
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white/60 rounded-xl p-6 border border-white/40">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
            <MoneyIcon />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalValue, userCurrency)}</div>
            <div className="text-sm text-slate-600">Total Project Value</div>
          </div>
        </div>
      </div>
      <div className="bg-white/60 rounded-xl p-6 border border-white/40">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalMilestones}</div>
            <div className="text-sm text-slate-600">Total Milestones</div>
          </div>
        </div>
      </div>
      <div className="bg-white/60 rounded-xl p-6 border border-white/40">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{completedMilestones}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
        </div>
      </div>
      <div className="bg-white/60 rounded-xl p-6 border border-white/40">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
            <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">%</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalMilestones > 0 ? Math.round(completedMilestones / totalMilestones * 100) : 0}%</div>
            <div className="text-sm text-slate-600">Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;
