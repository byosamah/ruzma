
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Project Progress</h3>
          <p className="text-sm text-slate-600">
            {completedMilestones} of {totalMilestones} milestones completed
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800">{progressPercentage}%</div>
          <div className="text-sm text-slate-600">Complete</div>
        </div>
      </div>
      <Progress value={progressPercentage} className="h-3" />
    </div>
  );
};

export default ProjectProgressBar;
