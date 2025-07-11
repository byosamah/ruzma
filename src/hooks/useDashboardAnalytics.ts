
import { useMemo } from 'react';
import { DatabaseProject } from './projectTypes';

interface AnalyticsData {
  revenueData: Array<{ month: string; revenue: number; projects: number }>;
  milestoneStatusData: Array<{ status: string; count: number; color: string }>;
  monthlyProgress: Array<{ month: string; completed: number; pending: number }>;
  revenueGrowth: number;
  avgProjectValue: number;
  completionRate: number;
}

export const useDashboardAnalytics = (projects: DatabaseProject[]): AnalyticsData => {
  return useMemo(() => {
    // Generate last 6 months of data
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        fullDate: date,
      });
    }

    // Calculate revenue data by month
    const revenueData = months.map(({ month, fullDate }) => {
      const monthStart = new Date(fullDate.getFullYear(), fullDate.getMonth(), 1);
      const monthEnd = new Date(fullDate.getFullYear(), fullDate.getMonth() + 1, 0);

      const monthProjects = projects.filter(project => {
        const projectDate = new Date(project.created_at);
        return projectDate >= monthStart && projectDate <= monthEnd;
      });

      const monthRevenue = monthProjects.reduce((sum, project) => {
        return sum + project.milestones
          .filter(m => m.status === 'approved')
          .reduce((mSum, m) => mSum + m.price, 0);
      }, 0);

      return {
        month,
        revenue: monthRevenue,
        projects: monthProjects.length,
      };
    });

    // Calculate milestone status distribution
    const allMilestones = projects.flatMap(p => p.milestones);
    const statusCounts = allMilestones.reduce((acc, milestone) => {
      acc[milestone.status] = (acc[milestone.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusColors = {
      pending: '#f59e0b',
      payment_submitted: '#3b82f6',
      approved: '#10b981',
      rejected: '#ef4444',
    };

    const milestoneStatusData = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' ').toUpperCase(),
      count,
      color: statusColors[status as keyof typeof statusColors] || '#6b7280',
    }));

    // Calculate monthly progress
    const monthlyProgress = months.map(({ month, fullDate }) => {
      const monthStart = new Date(fullDate.getFullYear(), fullDate.getMonth(), 1);
      const monthEnd = new Date(fullDate.getFullYear(), fullDate.getMonth() + 1, 0);

      const monthMilestones = projects.flatMap(project => 
        project.milestones.filter(milestone => {
          const milestoneDate = new Date(milestone.created_at);
          return milestoneDate >= monthStart && milestoneDate <= monthEnd;
        })
      );

      return {
        month,
        completed: monthMilestones.filter(m => m.status === 'approved').length,
        pending: monthMilestones.filter(m => m.status !== 'approved').length,
      };
    });

    // Calculate revenue growth (current month vs previous month)
    const currentMonthRevenue = revenueData[revenueData.length - 1]?.revenue || 0;
    const previousMonthRevenue = revenueData[revenueData.length - 2]?.revenue || 0;
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    // Calculate average project value
    const totalRevenue = projects.reduce((sum, project) => {
      return sum + project.milestones
        .filter(m => m.status === 'approved')
        .reduce((mSum, m) => mSum + m.price, 0);
    }, 0);
    const avgProjectValue = projects.length > 0 ? totalRevenue / projects.length : 0;

    // Calculate completion rate
    const totalMilestones = allMilestones.length;
    const completedMilestones = allMilestones.filter(m => m.status === 'approved').length;
    const completionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    return {
      revenueData,
      milestoneStatusData,
      monthlyProgress,
      revenueGrowth,
      avgProjectValue,
      completionRate,
    };
  }, [projects]);
};
