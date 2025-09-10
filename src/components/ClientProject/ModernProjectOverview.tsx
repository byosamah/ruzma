import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

const ModernProjectOverview = ({
  projectName,
  projectBrief,
  totalValue,
  totalMilestones,
  completedMilestones,
  currency,
  freelancerCurrency,
  startDate,
  endDate,
  branding,
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

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('projectProgress')}</h3>
              <Badge variant="secondary">
                {completedMilestones} of {totalMilestones} complete
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.round(progressPercentage)}% complete</span>
              <span>{totalMilestones - completedMilestones} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModernProjectOverview;