
import React from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { Progress } from '@/components/ui/progress';

interface ProjectProgressBarProps {
  project: DatabaseProject;
}

const ProjectProgressBar: React.FC<ProjectProgressBarProps> = ({
  project
}) => {
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalMilestones = project.milestones.length;
  const progressPercentage = totalMilestones > 0 ? Math.round(completedMilestones / totalMilestones * 100) : 0;

  return (
    <div className="bg-white/60 rounded-xl p-6 border border-white/40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">Project Progress</span>
        <span className="text-sm text-slate-600">{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="mt-2 text-xs text-slate-500">
        {completedMilestones} of {totalMilestones} milestones completed
      </div>
    </div>
  );
};

export default ProjectProgressBar;
