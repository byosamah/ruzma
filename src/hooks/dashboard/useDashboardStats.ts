
import { useMemo } from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';

export const useDashboardStats = (projects: DatabaseProject[]) => {
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalMilestones = projects.reduce((sum, project) => sum + project.milestones.length, 0);
    const completedMilestones = projects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'approved').length, 0);
    const pendingPayments = projects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'payment_submitted').length, 0);
    const totalEarnings = projects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0);
    
    return { totalProjects, totalMilestones, completedMilestones, pendingPayments, totalEarnings };
  }, [projects]);

  return stats;
};
