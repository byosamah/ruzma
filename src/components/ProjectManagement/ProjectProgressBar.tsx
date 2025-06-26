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
  return;
};
export default ProjectProgressBar;