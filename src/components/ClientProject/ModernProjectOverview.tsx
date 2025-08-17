import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useT } from '@/lib/i18n';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { format } from 'date-fns';
import { FreelancerBranding } from '@/types/branding';
import { Calendar, DollarSign, Target, TrendingUp } from 'lucide-react';

interface ModernProjectOverviewProps {
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

const ModernProjectOverview: React.FC<ModernProjectOverviewProps> = ({
  projectName,
  projectBrief,
  totalValue,
  totalMilestones,
  completedMilestones,
  currency,
  startDate,
  endDate,
}) => {
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

  const stats = [
    {
      icon: DollarSign,
      label: t('totalValue'),
      value: formatCurrency(totalValue, currency),
      variant: 'default' as const,
    },
    {
      icon: Target,
      label: t('progress'),
      value: `${completedMilestones}/${totalMilestones}`,
      subtitle: t('milestones'),
      variant: 'secondary' as const,
    },
    {
      icon: TrendingUp,
      label: t('completed'),
      value: `${Math.round(progressPercentage)}%`,
      variant: 'outline' as const,
    },
    ...(startDate || endDate ? [{
      icon: Calendar,
      label: t('timeline'),
      value: formatDateRange(),
      variant: 'outline' as const,
    }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {projectName}
          </CardTitle>
        </CardHeader>
        {projectBrief && (
          <CardContent className="pt-0">
            <p className="text-muted-foreground leading-relaxed">
              {projectBrief}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Project Progress Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Project Progress</h3>
              <Badge variant="secondary" className="text-xs">
                {completedMilestones} of {totalMilestones} complete
              </Badge>
            </div>
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{Math.round(progressPercentage)}% complete</span>
                <span>{totalMilestones - completedMilestones} remaining</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Single Line Stats Cards - Full Width */}
      <div className="grid grid-cols-4 gap-4 w-full">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200 aspect-square">
            <CardContent className="p-3 h-full flex flex-col justify-center items-center text-center">
              <div className="p-2 rounded-lg bg-muted mb-2">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-sm sm:text-base font-bold text-foreground leading-tight">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModernProjectOverview;