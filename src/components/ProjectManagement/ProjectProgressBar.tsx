
import { DatabaseProject } from '@/hooks/projectTypes';
import { Progress } from '@/components/ui/progress';

interface ProjectProgressBarProps {
  project: DatabaseProject;
}

function ProjectProgressBar({
  project
}: ProjectProgressBarProps) {
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalMilestones = project.milestones.length;
  const progressPercentage = totalMilestones > 0 ? Math.round(completedMilestones / totalMilestones * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Project Progress</span>
        <span className="text-sm text-gray-500">{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="text-xs text-gray-500">
        {completedMilestones} of {totalMilestones} milestones completed
      </div>
    </div>
  );
};

export default ProjectProgressBar;
