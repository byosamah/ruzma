import { DatabaseProject } from '@/hooks/projectTypes';
import { AdvancedAnalyticsData } from '@/types/advancedAnalytics';
import { useClientAnalytics } from './useClientAnalytics';
import { useProfitabilityAnalytics } from './useProfitabilityAnalytics';

export const useAdvancedAnalytics = (projects: DatabaseProject[]): AdvancedAnalyticsData => {
  const clientIntelligence = useClientAnalytics(projects);
  const profitability = useProfitabilityAnalytics(projects);

  return {
    clientIntelligence,
    profitability,
  };
};