import { useMemo } from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { ProjectTypeAnalytics, ProfitabilityData, ProfitabilityMetric } from '@/types/advancedAnalytics';

// Simple project categorization based on keywords in project name/brief
const categorizeProject = (project: DatabaseProject): string => {
  const text = `${project.name} ${project.brief}`.toLowerCase();
  
  if (text.includes('website') || text.includes('web') || text.includes('landing')) return 'Web Development';
  if (text.includes('app') || text.includes('mobile') || text.includes('ios') || text.includes('android')) return 'Mobile App';
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('logo') || text.includes('brand')) return 'Design & Branding';
  if (text.includes('marketing') || text.includes('seo') || text.includes('social') || text.includes('content')) return 'Marketing';
  if (text.includes('data') || text.includes('analytics') || text.includes('dashboard') || text.includes('report')) return 'Data & Analytics';
  if (text.includes('ecommerce') || text.includes('shop') || text.includes('store') || text.includes('e-commerce')) return 'E-commerce';
  if (text.includes('api') || text.includes('backend') || text.includes('database') || text.includes('server')) return 'Backend Development';
  if (text.includes('consult') || text.includes('strategy') || text.includes('advice')) return 'Consulting';
  
  return 'Other';
};

export const useProfitabilityAnalytics = (projects: DatabaseProject[]) => {
  const profitabilityData = useMemo((): ProfitabilityData => {
    // Group projects by type
    const projectsByType = new Map<string, DatabaseProject[]>();
    
    projects.forEach(project => {
      const category = categorizeProject(project);
      const categoryProjects = projectsByType.get(category) || [];
      categoryProjects.push(project);
      projectsByType.set(category, categoryProjects);
    });

    // Calculate analytics for each project type
    const projectTypes: ProjectTypeAnalytics[] = Array.from(projectsByType.entries()).map(([category, categoryProjects]) => {
      const totalRevenue = categoryProjects.reduce((sum, project) => 
        sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0
      );
      
      const avgRevenue = totalRevenue / categoryProjects.length;
      
      // Calculate average duration
      const projectsWithDates = categoryProjects.filter(p => p.start_date && p.end_date);
      const avgDuration = projectsWithDates.length > 0 
        ? projectsWithDates.reduce((sum, project) => {
            const duration = Math.ceil((new Date(project.end_date!).getTime() - new Date(project.start_date!).getTime()) / (1000 * 60 * 60 * 24));
            return sum + Math.max(1, duration);
          }, 0) / projectsWithDates.length
        : 30; // default 30 days if no dates
      
      const revenuePerDay = avgRevenue / avgDuration;
      
      // Calculate completion rate
      const totalMilestones = categoryProjects.reduce((sum, project) => sum + project.milestones.length, 0);
      const completedMilestones = categoryProjects.reduce((sum, project) => 
        sum + project.milestones.filter(m => m.status === 'approved').length, 0
      );
      const completionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
      
      // Calculate client satisfaction proxy (repeat business rate)
      const clientEmails = new Set(categoryProjects.map(p => p.client_email).filter(Boolean));
      const repeatClients = Array.from(clientEmails).filter(email => 
        categoryProjects.filter(p => p.client_email === email).length > 1
      );
      const clientSatisfactionProxy = clientEmails.size > 0 ? (repeatClients.length / clientEmails.size) * 100 : 0;
      
      // Market demand is simply the frequency of this project type
      const marketDemand = (categoryProjects.length / projects.length) * 100;
      
      return {
        category,
        projectCount: categoryProjects.length,
        avgRevenue,
        totalRevenue,
        avgDuration,
        revenuePerDay,
        completionRate,
        clientSatisfactionProxy,
        marketDemand,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Generate pricing trends (last 6 months)
    const pricingTrends = Array.from({length: 6}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthProjects = projects.filter(project => {
        const projectDate = new Date(project.created_at);
        return projectDate.getMonth() === date.getMonth() && projectDate.getFullYear() === date.getFullYear();
      });
      
      const avgPrice = monthProjects.length > 0 
        ? monthProjects.reduce((sum, project) => 
            sum + project.milestones.reduce((mSum, m) => mSum + m.price, 0), 0
          ) / monthProjects.length
        : 0;
      
      return {
        month: monthStr,
        avgPrice,
        projectCount: monthProjects.length,
      };
    });

    // Calculate profitability metrics
    const currentMonthRevenue = projects
      .filter(p => new Date(p.created_at).getMonth() === new Date().getMonth())
      .reduce((sum, project) => 
        sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0
      );
    
    const lastMonthRevenue = projects
      .filter(p => {
        const date = new Date(p.created_at);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, project) => 
        sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0
      );

    const profitabilityMetrics: ProfitabilityMetric[] = [
      {
        metric: 'Monthly Revenue Growth',
        value: lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
        trend: currentMonthRevenue > lastMonthRevenue ? 'up' : currentMonthRevenue < lastMonthRevenue ? 'down' : 'stable',
        period: 'Month over Month',
      },
      {
        metric: 'Average Project Margin',
        value: projectTypes.length > 0 ? projectTypes.reduce((sum, pt) => sum + pt.completionRate, 0) / projectTypes.length : 0,
        trend: 'stable',
        period: 'Current Period',
      },
    ];

    // Revenue optimization suggestions
    const currentAvgRate = projects.length > 0 
      ? projects.reduce((sum, project) => 
          sum + project.milestones.reduce((mSum, m) => mSum + m.price, 0), 0
        ) / projects.length
      : 0;
    
    const topPerformingRate = projectTypes.length > 0 
      ? Math.max(...projectTypes.map(pt => pt.revenuePerDay)) * 30 // convert to monthly
      : currentAvgRate;
    
    const suggestedRate = Math.min(currentAvgRate * 1.15, topPerformingRate); // 15% increase or top rate
    const potentialIncrease = ((suggestedRate - currentAvgRate) / currentAvgRate) * 100;

    const revenueOptimization = {
      currentAvgRate,
      suggestedRate,
      potentialIncrease: Math.max(0, potentialIncrease),
    };

    return {
      projectTypes,
      pricingTrends,
      profitabilityMetrics,
      revenueOptimization,
    };
  }, [projects]);

  return profitabilityData;
};