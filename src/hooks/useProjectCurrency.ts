import { useMemo } from 'react';
import { CurrencyCode } from '@/lib/currency';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useUserCurrencyPreference } from './useCurrencyDisplay';

export interface ProjectCurrencyInfo {
  projectCurrency: CurrencyCode;
  userCurrency: CurrencyCode;
  needsConversion: boolean;
  isUserProject: boolean;
  language: 'en' | 'ar';
}

/**
 * Hook to get currency information for a project
 * Determines project currency, user currency, and whether conversion is needed
 */
export const useProjectCurrency = (
  project?: DatabaseProject | null,
  userId?: string
): ProjectCurrencyInfo => {
  const { currency: userCurrency, language } = useUserCurrencyPreference();

  return useMemo(() => {
    const projectCurrency = (project?.freelancer_currency as CurrencyCode) || 'USD';
    const isUserProject = project?.user_id === userId;
    const needsConversion = projectCurrency !== userCurrency && isUserProject;

    return {
      projectCurrency,
      userCurrency,
      needsConversion,
      isUserProject,
      language,
    };
  }, [project, userId, userCurrency, language]);
};

/**
 * Hook for milestone currency display within a project context
 */
export const useMilestoneCurrency = (
  project?: DatabaseProject | null,
  userId?: string,
  isClientView: boolean = false
) => {
  const projectCurrencyInfo = useProjectCurrency(project, userId);

  return useMemo(() => {
    const { projectCurrency, userCurrency, needsConversion, isUserProject } = projectCurrencyInfo;

    return {
      ...projectCurrencyInfo,
      // For client view, always use project currency, no conversion
      displayCurrency: isClientView ? projectCurrency : userCurrency,
      // Show conversion indicator only for freelancer view when currencies differ
      showConversion: !isClientView && needsConversion && isUserProject,
      // Use project currency as the source for conversion
      sourceCurrency: projectCurrency,
    };
  }, [projectCurrencyInfo, isClientView]);
};

/**
 * Hook for dashboard/listing currency display
 * Converts all project amounts to user's preferred currency
 */
export const useListingCurrency = (userId?: string) => {
  const { currency: userCurrency, language } = useUserCurrencyPreference();

  return useMemo(() => ({
    targetCurrency: userCurrency,
    language,
    // Always show conversions in listings
    showConversion: true,
    // Show original amounts for clarity
    showOriginalAmounts: true,
    // Use compact format for space efficiency
    compactFormat: true,
  }), [userCurrency, language]);
};

/**
 * Hook for invoice currency display
 * Handles both project-linked and standalone invoices
 */
export const useInvoiceCurrency = (
  invoice?: { 
    currency?: string; 
    project_id?: string;
    project?: DatabaseProject;
  },
  userId?: string
) => {
  const { currency: userCurrency, language } = useUserCurrencyPreference();

  return useMemo(() => {
    // Invoice has its own currency (new invoices)
    if (invoice?.currency) {
      const invoiceCurrency = invoice.currency as CurrencyCode;
      return {
        sourceCurrency: invoiceCurrency,
        displayCurrency: userCurrency,
        showConversion: invoiceCurrency !== userCurrency,
        language,
      };
    }

    // Invoice linked to project - use project currency
    if (invoice?.project) {
      const projectCurrency = (invoice.project.freelancer_currency as CurrencyCode) || 'USD';
      return {
        sourceCurrency: projectCurrency,
        displayCurrency: userCurrency,
        showConversion: projectCurrency !== userCurrency,
        language,
      };
    }

    // Fallback to user currency
    return {
      sourceCurrency: userCurrency,
      displayCurrency: userCurrency,
      showConversion: false,
      language,
    };
  }, [invoice, userCurrency, language]);
};

/**
 * Utility hook to format project totals with proper currency handling
 */
export const useProjectTotals = (
  projects: DatabaseProject[],
  userId?: string
) => {
  const { currency: userCurrency } = useUserCurrencyPreference();

  return useMemo(() => {
    const projectsWithCurrency = projects.map(project => {
      const projectCurrency = (project.freelancer_currency as CurrencyCode) || 'USD';
      const milestoneTotal = project.milestones?.reduce((sum, milestone) => sum + milestone.price, 0) || 0;

      return {
        id: project.id,
        name: project.name,
        amount: milestoneTotal,
        currency: projectCurrency,
        needsConversion: projectCurrency !== userCurrency,
      };
    });

    const totalAmount = projectsWithCurrency.reduce((sum, project) => sum + project.amount, 0);

    return {
      projects: projectsWithCurrency,
      totalAmount,
      userCurrency,
      hasMultipleCurrencies: new Set(projectsWithCurrency.map(p => p.currency)).size > 1,
    };
  }, [projects, userCurrency]);
};