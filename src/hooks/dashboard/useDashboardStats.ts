
import { useMemo } from 'react';
import { DatabaseProject } from '@/types/shared';

interface DashboardStats {
  totalProjects: number;
  totalEarnings: number;
  completedMilestones: number;
  totalMilestones: number;
  pendingPayments: number;
  thisMonthEarnings: number;
  earningsGrowth: number;
  completionRate: number;
}

export const useDashboardStats = (projects: DatabaseProject[]): DashboardStats => {
  return useMemo(() => {
    const totalProjects = projects.length;
    
    // Calculate earnings and milestones
    let totalEarnings = 0;
    let completedMilestones = 0;
    let totalMilestones = 0;
    let pendingPayments = 0;
    
    projects.forEach(project => {
      project.milestones.forEach(milestone => {
        totalMilestones++;
        if (milestone.status === 'approved') {
          completedMilestones++;
          totalEarnings += Number(milestone.price);
        } else if (milestone.status === 'payment_submitted') {
          pendingPayments += Number(milestone.price);
        }
      });
    });
    
    // Calculate this month's earnings
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let thisMonthEarnings = 0;
    let lastMonthEarnings = 0;
    
    projects.forEach(project => {
      project.milestones
        .filter(m => m.status === 'approved')
        .forEach(milestone => {
          const milestoneDate = new Date(milestone.updated_at);
          if (milestoneDate.getMonth() === currentMonth && milestoneDate.getFullYear() === currentYear) {
            thisMonthEarnings += Number(milestone.price);
          } else if (milestoneDate.getMonth() === currentMonth - 1 && milestoneDate.getFullYear() === currentYear) {
            lastMonthEarnings += Number(milestone.price);
          }
        });
    });
    
    // Calculate earnings growth
    const earningsGrowth = lastMonthEarnings > 0 
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
      : thisMonthEarnings > 0 ? 100 : 0;
    
    // Calculate completion rate
    const completionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    
    return {
      totalProjects,
      totalEarnings,
      completedMilestones,
      totalMilestones,
      pendingPayments,
      thisMonthEarnings,
      earningsGrowth,
      completionRate,
    };
  }, [projects]);
};
