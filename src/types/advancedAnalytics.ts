export interface ClientAnalytics {
  clientId: string;
  clientName: string;
  clientEmail: string;
  lifetimeValue: number;
  totalProjects: number;
  avgProjectValue: number;
  retentionRate: number;
  paymentReliability: number;
  collaborationDuration: number; // in months
  growthTrend: 'increasing' | 'stable' | 'decreasing';
  riskLevel: 'low' | 'medium' | 'high';
  lastProjectDate: string;
  firstProjectDate: string;
}

export interface ClientSegment {
  segment: 'champion' | 'growing' | 'stable' | 'at-risk' | 'one-time';
  count: number;
  totalValue: number;
  avgValue: number;
  color: string;
}

export interface ProjectTypeAnalytics {
  category: string;
  projectCount: number;
  avgRevenue: number;
  totalRevenue: number;
  avgDuration: number; // in days
  revenuePerDay: number;
  completionRate: number;
  clientSatisfactionProxy: number; // based on repeat business
  marketDemand: number; // frequency of this project type
}

export interface ProfitabilityMetric {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface ClientIntelligenceData {
  totalClients: number;
  clientSegments: ClientSegment[];
  topClientsByValue: ClientAnalytics[];
  clientRetentionRate: number;
  averageClientLifetime: number;
  riskAssessment: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}

export interface ProfitabilityData {
  projectTypes: ProjectTypeAnalytics[];
  pricingTrends: {
    month: string;
    avgPrice: number;
    projectCount: number;
  }[];
  profitabilityMetrics: ProfitabilityMetric[];
  revenueOptimization: {
    currentAvgRate: number;
    suggestedRate: number;
    potentialIncrease: number;
  };
}

export interface AdvancedAnalyticsData {
  clientIntelligence: ClientIntelligenceData;
  profitability: ProfitabilityData;
}