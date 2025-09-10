
import { useMemo, useState, useEffect } from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { CurrencyCode } from '@/lib/currency';
import { ServiceRegistry } from '@/services/core/ServiceRegistry';
import { useAuth } from '@/hooks/core/useAuth';
import { CurrencyConversionCoordinator } from '@/services/core/CurrencyConversionCoordinator';

export const useDashboardStats = (projects: DatabaseProject[], userCurrency: CurrencyCode) => {
  const { user } = useAuth();
  const [convertedEarnings, setConvertedEarnings] = useState<number>(0);
  // Convert earnings from each project currency to user currency
  useEffect(() => {
    const calculateConvertedEarnings = async () => {
      if (!user || !projects.length) {
        setConvertedEarnings(0);
        return;
      }

      const coordinator = CurrencyConversionCoordinator.getInstance();
      
      // Prepare batch conversion for consistency
      const conversions: Array<{ amount: number; fromCurrency: CurrencyCode }> = [];

      for (const project of projects) {
        // Use project currency first (what was chosen for the project), fallback to freelancer currency
        const rawCurrency = project.currency || project.freelancer_currency;
        const projectCurrency = (rawCurrency && rawCurrency.trim()) || 'USD';
        
        // Validate that we have a proper currency code
        if (!projectCurrency || projectCurrency === 'undefined' || projectCurrency === 'null') {
          console.warn('Invalid currency found in project:', project.id, 'using USD fallback');
          continue; // Skip projects with invalid currencies
        }

        const projectEarnings = project.milestones
          .filter(m => m.status === 'approved')
          .reduce((sum, m) => sum + m.price, 0);

        if (projectEarnings > 0) {
          conversions.push({
            amount: projectEarnings,
            fromCurrency: projectCurrency as CurrencyCode
          });
        }
      }

      try {
        
        // Use coordinated batch conversion to ensure all use same exchange rates
        const results = await coordinator.coordinatedBatchConversion(conversions, userCurrency, user);
        const totalConverted = results.reduce((sum, result) => sum + result.convertedAmount, 0);
        
        
        setConvertedEarnings(totalConverted);
      } catch (error) {
        console.error('Failed to calculate converted earnings:', error);
        // Fallback: sum original amounts without conversion
        const fallbackTotal = conversions.reduce((sum, conv) => sum + conv.amount, 0);
        setConvertedEarnings(fallbackTotal);
      }
    };

    calculateConvertedEarnings();
  }, [projects, userCurrency, user]);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalMilestones = projects.reduce((sum, project) => sum + project.milestones.length, 0);
    const completedMilestones = projects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'approved').length, 0);
    const pendingPayments = projects.reduce((sum, project) => 
      sum + project.milestones.filter(m => m.status === 'payment_submitted').length, 0);
    
    return { 
      totalProjects, 
      totalMilestones, 
      completedMilestones, 
      pendingPayments, 
      totalEarnings: convertedEarnings // Use converted earnings
    };
  }, [projects, convertedEarnings]);

  return stats;
};
