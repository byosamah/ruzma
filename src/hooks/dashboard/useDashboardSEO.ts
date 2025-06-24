
import { useMemo } from 'react';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { DatabaseProject } from '@/hooks/projectTypes';

interface DashboardStats {
  totalProjects: number;
  totalEarnings: number;
  completedMilestones: number;
  totalMilestones: number;
  pendingPayments: number;
}

export const useDashboardSEO = (
  displayName: string,
  stats: DashboardStats,
  userCurrency: CurrencyCode,
  projects: DatabaseProject[]
) => {
  return useMemo(() => {
    const baseUrl = window.location.origin;
    const title = `${displayName}'s Dashboard | ${stats.totalProjects} Projects | Ruzma`;
    
    const description = `Freelance dashboard for ${displayName}. Managing ${stats.totalProjects} active projects with ${formatCurrency(stats.totalEarnings, userCurrency)} in total earnings. ${stats.completedMilestones} of ${stats.totalMilestones} milestones completed.`;
    
    // Generate keywords based on user data
    const projectTypes = projects.map(p => p.title.toLowerCase()).join(', ');
    const keywords = [
      'freelance dashboard',
      'project management',
      'milestone tracking',
      'payment management',
      'freelancer tools',
      displayName.toLowerCase(),
      projectTypes
    ].filter(Boolean).join(', ');

    // Generate structured data for the dashboard
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "name": displayName,
        "jobTitle": "Freelancer",
        "worksFor": {
          "@type": "Organization",
          "name": "Independent Freelancer"
        },
        "knowsAbout": projects.map(p => p.title).slice(0, 5),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${baseUrl}/dashboard`
        }
      },
      "about": {
        "@type": "Thing",
        "name": "Freelance Project Management",
        "description": `Dashboard showing ${stats.totalProjects} projects and ${formatCurrency(stats.totalEarnings, userCurrency)} in earnings`
      }
    };

    return {
      title,
      description,
      keywords,
      canonical: `${baseUrl}/dashboard`,
      type: 'profile' as const,
      author: displayName,
      structuredData
    };
  }, [displayName, stats, userCurrency, projects]);
};
