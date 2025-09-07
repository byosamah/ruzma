import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { deepSeekService } from '@/services/ai/DeepSeekService';
import { createAIUsageService } from '@/services/ai/AIUsageService';
import { useAuth } from '@/hooks/core/useAuth';
import type { DatabaseProject } from '@/hooks/projectTypes';

interface AIInsightsData {
  insights: Array<{
    category: 'revenue' | 'efficiency' | 'clients' | 'growth' | 'risks';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    recommendation: string;
    impact: string;
    confidence: number;
  }>;
  projectRecommendations: string[];
  revenueOptimizationTips: string[];
  isLoading: boolean;
  error: string | null;
  canUseAI: boolean;
  upgradeRequired: boolean;
  usageInfo?: {
    insights: { used: number; limit: number };
    recommendations: { used: number; limit: number };
    revenue: { used: number; limit: number };
  };
}

export const useAIInsights = (
  projects: DatabaseProject[], 
  currency: string = 'USD'
): AIInsightsData => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Check AI usage permissions
  const usageService = createAIUsageService(user);
  
  const { data: usageCheck } = useQuery({
    queryKey: ['ai-usage-check', user?.id, 'business_insights'],
    queryFn: () => usageService.canMakeAICall('business_insights'),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Prepare analytics data for AI analysis
  const prepareAnalyticsData = () => {
    if (!projects || projects.length === 0) {
      return null;
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const completedProjects = projects.filter(p => 
      p.milestones.some(m => m.status === 'approved' || m.status === 'payment_submitted')
    );
    
    const activeProjects = projects.filter(p => 
      p.milestones.some(m => m.status === 'pending')
    );

    const thisMonthProjects = projects.filter(p => 
      new Date(p.created_at) >= thisMonth
    );

    // Calculate revenue metrics
    const totalRevenue = projects.reduce((sum, project) => {
      return sum + project.milestones
        .filter(m => m.status === 'approved' || m.status === 'payment_submitted')
        .reduce((mSum, m) => mSum + m.price, 0);
    }, 0);

    const monthlyRevenue = thisMonthProjects.reduce((sum, project) => {
      return sum + project.milestones
        .filter(m => m.status === 'approved' || m.status === 'payment_submitted')
        .reduce((mSum, m) => mSum + m.price, 0);
    }, 0);

    // Calculate client metrics
    const uniqueClients = new Set(
      projects
        .map(p => p.client_email || p.client_name)
        .filter(Boolean)
    );

    const clientProjects = projects.reduce((acc, p) => {
      const client = p.client_email || p.client_name || 'unknown';
      if (!acc[client]) acc[client] = [];
      acc[client].push(p);
      return acc;
    }, {} as Record<string, DatabaseProject[]>);

    const repeatClients = Object.values(clientProjects).filter(projects => projects.length > 1).length;

    // Calculate performance metrics
    const totalMilestones = projects.flatMap(p => p.milestones).length;
    const completedMilestones = projects.flatMap(p => 
      p.milestones.filter(m => m.status === 'approved' || m.status === 'payment_submitted')
    ).length;

    const onTimeProjects = projects.filter(p => {
      if (!p.end_date) return true;
      const deadline = new Date(p.end_date);
      const completion = p.milestones.length > 0
        ? new Date(Math.max(...p.milestones.map(m => new Date(m.updated_at).getTime())))
        : new Date(p.updated_at);
      return completion <= deadline;
    }).length;

    // Calculate durations and payment speed
    const projectDurations = completedProjects.map(p => {
      const start = p.start_date ? new Date(p.start_date) : new Date(p.created_at);
      const end = p.end_date ? new Date(p.end_date) : new Date(p.updated_at);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    });

    const approvedMilestones = projects.flatMap(p => 
      p.milestones.filter(m => m.status === 'approved' || m.status === 'payment_submitted')
    );

    const paymentTimes = approvedMilestones.map(m => {
      const created = new Date(m.created_at);
      const updated = new Date(m.updated_at);
      return Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    });

    // Project type distribution
    const projectTypes = [
      { 
        label: 'Web Development', 
        value: projects.filter(p => 
          p.name?.toLowerCase().includes('web') || p.brief?.toLowerCase().includes('website')
        ).length 
      },
      { 
        label: 'Design', 
        value: projects.filter(p => 
          p.name?.toLowerCase().includes('design') || p.brief?.toLowerCase().includes('ui')
        ).length 
      },
      { 
        label: 'Mobile Apps', 
        value: projects.filter(p => 
          p.name?.toLowerCase().includes('app') || p.brief?.toLowerCase().includes('mobile')
        ).length 
      },
      { 
        label: 'Other', 
        value: projects.filter(p => 
          !['web', 'design', 'app'].some(keyword => 
            p.name?.toLowerCase().includes(keyword) || p.brief?.toLowerCase().includes(keyword)
          )
        ).length 
      },
    ].filter(type => type.value > 0);

    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      totalRevenue: Math.round(totalRevenue),
      monthlyRevenue: Math.round(monthlyRevenue),
      averageProjectValue: Math.round(totalRevenue / Math.max(projects.length, 1)),
      clientCount: uniqueClients.size,
      repeatClientRate: Math.round((repeatClients / Math.max(uniqueClients.size, 1)) * 100),
      onTimeDeliveryRate: Math.round((onTimeProjects / Math.max(projects.length, 1)) * 100),
      successRate: Math.round((completedMilestones / Math.max(totalMilestones, 1)) * 100),
      averageProjectDuration: Math.round(
        projectDurations.reduce((sum, days) => sum + days, 0) / Math.max(projectDurations.length, 1)
      ),
      paymentCollectionSpeed: Math.round(
        paymentTimes.reduce((sum, days) => sum + days, 0) / Math.max(paymentTimes.length, 1)
      ),
      projectTypes,
      revenueGrowth: monthlyRevenue > 0 && totalRevenue > monthlyRevenue 
        ? Math.round(((monthlyRevenue * 12 - totalRevenue) / totalRevenue) * 100) 
        : 0,
      clientSatisfaction: Math.max(0, 100 - Math.round((projects.flatMap(p => 
        p.milestones.filter(m => m.status === 'rejected')
      ).length / Math.max(totalMilestones, 1)) * 100))
    };
  };

  const analyticsData = prepareAnalyticsData();

  // Main insights query
  const insightsQuery = useQuery({
    queryKey: ['ai-insights', analyticsData],
    queryFn: async () => {
      const result = await deepSeekService.generateBusinessInsights(analyticsData!);
      await usageService.recordAIUsage('business_insights');
      return result;
    },
    enabled: !!analyticsData && analyticsData.totalProjects > 0 && usageCheck?.canCall === true,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
    onError: (error: any) => {
      setError(error.message || 'Failed to generate AI insights');
    }
  });

  // Project recommendations query
  const projectRecommendationsQuery = useQuery({
    queryKey: ['ai-project-recommendations', analyticsData?.projectTypes],
    queryFn: async () => {
      const result = await deepSeekService.generateProjectTypeRecommendations(analyticsData!.projectTypes);
      await usageService.recordAIUsage('project_recommendations');
      return result;
    },
    enabled: !!analyticsData && analyticsData.totalProjects > 0 && usageCheck?.canCall === true,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    onError: (error: any) => {
      console.error('Project recommendations failed:', error);
    }
  });

  // Revenue optimization query
  const revenueOptimizationQuery = useQuery({
    queryKey: ['ai-revenue-optimization', analyticsData?.totalRevenue, analyticsData?.revenueGrowth],
    queryFn: async () => {
      const result = await deepSeekService.generateRevenueOptimizationTips({
        current: analyticsData!.monthlyRevenue,
        growth: analyticsData!.revenueGrowth,
        averageProject: analyticsData!.averageProjectValue
      });
      await usageService.recordAIUsage('revenue_optimization');
      return result;
    },
    enabled: !!analyticsData && analyticsData.totalProjects > 0 && usageCheck?.canCall === true,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    onError: (error: any) => {
      console.error('Revenue optimization failed:', error);
    }
  });

  return {
    insights: insightsQuery.data || [],
    projectRecommendations: projectRecommendationsQuery.data || [],
    revenueOptimizationTips: revenueOptimizationQuery.data || [],
    isLoading: insightsQuery.isLoading || projectRecommendationsQuery.isLoading || revenueOptimizationQuery.isLoading || (!usageCheck && !!user),
    error: error || (insightsQuery.error ? String(insightsQuery.error) : null),
    canUseAI: usageCheck?.canCall || false,
    upgradeRequired: usageCheck?.upgradeRequired || false,
    usageInfo: usageCheck?.usageCount !== undefined && usageCheck?.limit !== undefined ? {
      insights: { used: usageCheck.usageCount, limit: usageCheck.limit },
      recommendations: { used: usageCheck.usageCount, limit: usageCheck.limit },
      revenue: { used: usageCheck.usageCount, limit: usageCheck.limit }
    } : undefined
  };
};