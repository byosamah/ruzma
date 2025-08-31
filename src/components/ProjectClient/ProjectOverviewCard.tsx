
import React from 'react';
import { useT } from '@/lib/i18n';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { format } from 'date-fns';
import { FreelancerBranding } from '@/types/branding';
import { StatCard } from '@/components/shared';

interface ProjectOverviewCardProps {
  projectName: string;
  projectBrief?: string;
  totalValue: number;
  totalMilestones: number;
  completedMilestones: number;
  currency: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  startDate?: string;
  endDate?: string;
  branding?: FreelancerBranding | null;
}

function ProjectOverviewCard({
  projectName,
  projectBrief,
  totalValue,
  totalMilestones,
  completedMilestones,
  currency,
  startDate,
  endDate,
}: ProjectOverviewCardProps) {
  const t = useT();
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d')}`;
    } else if (startDate) {
      return `${t('starts')} ${format(new Date(startDate), 'MMM d, yyyy')}`;
    } else if (endDate) {
      return `${t('ends')} ${format(new Date(endDate), 'MMM d, yyyy')}`;
    }
    return t('noDateSet');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Project Title and Brief */}
      <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-medium text-foreground mb-2">
          {projectName}
        </h2>
        {projectBrief && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {projectBrief}
          </p>
        )}
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          emoji="💰"
          title={t('totalValue')}
          value={formatCurrency(totalValue, currency)}
        />

        <StatCard
          emoji="📊"
          title={t('progress')}
          value={`${completedMilestones}/${totalMilestones}`}
          subtitle={t('milestones')}
        />

        <StatCard
          emoji="✅"
          title={t('completed')}
          value={`${Math.round(progressPercentage)}%`}
        />

        {(startDate || endDate) && (
          <StatCard
            emoji="📅"
            title={t('timeline')}
            value={formatDateRange()}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectOverviewCard;
