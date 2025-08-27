import { useMemo } from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { ClientAnalytics, ClientSegment, ClientIntelligenceData } from '@/types/advancedAnalytics';

export const useClientAnalytics = (projects: DatabaseProject[]) => {
  const clientIntelligence = useMemo((): ClientIntelligenceData => {
    // Group projects by client
    const clientProjectsMap = new Map<string, DatabaseProject[]>();
    
    projects.forEach(project => {
      if (project.client_email) {
        const clientProjects = clientProjectsMap.get(project.client_email) || [];
        clientProjects.push(project);
        clientProjectsMap.set(project.client_email, clientProjects);
      }
    });

    // Calculate analytics for each client
    const clientAnalytics: ClientAnalytics[] = Array.from(clientProjectsMap.entries()).map(([email, clientProjects]) => {
      const firstProject = clientProjects.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
      const lastProject = clientProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      const totalRevenue = clientProjects.reduce((sum, project) => 
        sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0
      );
      
      const totalMilestones = clientProjects.reduce((sum, project) => sum + project.milestones.length, 0);
      const completedMilestones = clientProjects.reduce((sum, project) => 
        sum + project.milestones.filter(m => m.status === 'approved').length, 0
      );
      
      const collaborationMonths = Math.max(1, 
        Math.ceil((new Date(lastProject.created_at).getTime() - new Date(firstProject.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
      );
      
      const avgProjectValue = totalRevenue / clientProjects.length;
      const paymentReliability = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
      
      // Calculate growth trend
      const recentProjects = clientProjects.filter(p => 
        new Date(p.created_at).getTime() > Date.now() - (6 * 30 * 24 * 60 * 60 * 1000) // last 6 months
      );
      const olderProjects = clientProjects.filter(p => 
        new Date(p.created_at).getTime() <= Date.now() - (6 * 30 * 24 * 60 * 60 * 1000)
      );
      
      let growthTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (recentProjects.length && olderProjects.length) {
        const recentAvg = recentProjects.reduce((sum, p) => sum + p.milestones.reduce((mSum, m) => mSum + m.price, 0), 0) / recentProjects.length;
        const olderAvg = olderProjects.reduce((sum, p) => sum + p.milestones.reduce((mSum, m) => mSum + m.price, 0), 0) / olderProjects.length;
        
        if (recentAvg > olderAvg * 1.1) growthTrend = 'increasing';
        else if (recentAvg < olderAvg * 0.9) growthTrend = 'decreasing';
      }
      
      // Calculate risk level
      const daysSinceLastProject = Math.floor((Date.now() - new Date(lastProject.created_at).getTime()) / (1000 * 60 * 60 * 24));
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      
      if (daysSinceLastProject > 180 || paymentReliability < 60) riskLevel = 'high';
      else if (daysSinceLastProject > 90 || paymentReliability < 80) riskLevel = 'medium';

      return {
        clientId: firstProject.client_email || '',
        clientName: firstProject.client_email?.split('@')[0] || 'Unknown',
        clientEmail: email,
        lifetimeValue: totalRevenue,
        totalProjects: clientProjects.length,
        avgProjectValue,
        retentionRate: clientProjects.length > 1 ? 100 : 0,
        paymentReliability,
        collaborationDuration: collaborationMonths,
        growthTrend,
        riskLevel,
        lastProjectDate: lastProject.created_at,
        firstProjectDate: firstProject.created_at,
      };
    });

    // Create client segments
    const segments: ClientSegment[] = [
      {
        segment: 'champion',
        count: clientAnalytics.filter(c => c.lifetimeValue > 5000 && c.totalProjects >= 3 && c.riskLevel === 'low').length,
        totalValue: clientAnalytics.filter(c => c.lifetimeValue > 5000 && c.totalProjects >= 3 && c.riskLevel === 'low').reduce((sum, c) => sum + c.lifetimeValue, 0),
        avgValue: 0,
        color: '#10b981'
      },
      {
        segment: 'growing',
        count: clientAnalytics.filter(c => c.growthTrend === 'increasing' && c.totalProjects >= 2).length,
        totalValue: clientAnalytics.filter(c => c.growthTrend === 'increasing' && c.totalProjects >= 2).reduce((sum, c) => sum + c.lifetimeValue, 0),
        avgValue: 0,
        color: '#3b82f6'
      },
      {
        segment: 'stable',
        count: clientAnalytics.filter(c => c.totalProjects >= 2 && c.growthTrend === 'stable' && c.riskLevel === 'low').length,
        totalValue: clientAnalytics.filter(c => c.totalProjects >= 2 && c.growthTrend === 'stable' && c.riskLevel === 'low').reduce((sum, c) => sum + c.lifetimeValue, 0),
        avgValue: 0,
        color: '#6366f1'
      },
      {
        segment: 'at-risk',
        count: clientAnalytics.filter(c => c.riskLevel === 'high' || c.growthTrend === 'decreasing').length,
        totalValue: clientAnalytics.filter(c => c.riskLevel === 'high' || c.growthTrend === 'decreasing').reduce((sum, c) => sum + c.lifetimeValue, 0),
        avgValue: 0,
        color: '#ef4444'
      },
      {
        segment: 'one-time',
        count: clientAnalytics.filter(c => c.totalProjects === 1).length,
        totalValue: clientAnalytics.filter(c => c.totalProjects === 1).reduce((sum, c) => sum + c.lifetimeValue, 0),
        avgValue: 0,
        color: '#6b7280'
      }
    ];

    // Calculate average values for segments
    segments.forEach(segment => {
      segment.avgValue = segment.count > 0 ? segment.totalValue / segment.count : 0;
    });

    const totalClients = clientAnalytics.length;
    const returningClients = clientAnalytics.filter(c => c.totalProjects > 1).length;
    const clientRetentionRate = totalClients > 0 ? (returningClients / totalClients) * 100 : 0;
    
    const averageClientLifetime = totalClients > 0 
      ? clientAnalytics.reduce((sum, c) => sum + c.collaborationDuration, 0) / totalClients 
      : 0;

    const riskAssessment = {
      highRisk: clientAnalytics.filter(c => c.riskLevel === 'high').length,
      mediumRisk: clientAnalytics.filter(c => c.riskLevel === 'medium').length,
      lowRisk: clientAnalytics.filter(c => c.riskLevel === 'low').length,
    };

    const topClientsByValue = clientAnalytics
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .slice(0, 10);

    return {
      totalClients,
      clientSegments: segments,
      topClientsByValue,
      clientRetentionRate,
      averageClientLifetime,
      riskAssessment,
    };
  }, [projects]);

  return clientIntelligence;
};