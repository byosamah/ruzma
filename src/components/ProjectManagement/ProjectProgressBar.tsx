
import React from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { Progress } from '@/components/ui/progress';

interface ProjectProgressBarProps {
  project: DatabaseProject;
}

const ProjectProgressBar: React.FC<ProjectProgressBarProps> = ({ project }) => {
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalMilestones = project.milestones.length;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">Project Progress</span>
        <span className="text-slate-800 font-medium">{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="text-xs text-slate-500">
        {completedMilestones} of {totalMilestones} milestones completed
      </div>
    </div>
  );
};

export default ProjectProgressBar;
