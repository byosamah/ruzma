
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Target, TrendingUp } from 'lucide-react';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';
import { FreelancerBranding } from '@/types/branding';

interface ProjectOverviewCardProps {
  projectName: string;
  projectBrief: string;
  totalValue: number;
  totalMilestones: number;
  completedMilestones: number;
  currency: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  startDate?: string;
  endDate?: string;
  branding?: FreelancerBranding | null;
}

const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({
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
  const isMobile = useIsMobile();
  const primaryColor = branding?.primary_color || '#4B72E5';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <Card className="bg-white shadow-sm border border-slate-100">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-8">
          
          {/* Project Header */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              {projectName}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed max-w-3xl mx-auto">
              {projectBrief}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Value */}
            <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-center mb-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <DollarSign className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{t('totalValue')}</p>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(totalValue, freelancerCurrency || currency)}
                </p>
                {freelancerCurrency && freelancerCurrency !== currency && (
                  <p className="text-xs text-slate-400">
                    ({formatCurrency(totalValue, currency)})
                  </p>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-center mb-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <TrendingUp className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{t('progress')}</p>
                <p className="text-xl font-bold text-slate-800">
                  {completedMilestones}/{totalMilestones}
                </p>
                <p className="text-xs text-slate-400">
                  {Math.round(progressPercentage)}% {t('complete')}
                </p>
              </div>
            </div>

            {/* Start Date */}
            {startDate && (
              <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-center mb-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Calendar className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{t('startDate')}</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {formatDate(startDate)}
                  </p>
                </div>
              </div>
            )}

            {/* End Date */}
            {endDate && (
              <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-center mb-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Calendar className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{t('deadline')}</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {formatDate(endDate)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">{t('overallProgress')}</h3>
              <Badge 
                variant="secondary" 
                className="text-sm font-medium"
                style={{ 
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}20`
                }}
              >
                {Math.round(progressPercentage)}% {t('complete')}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: primaryColor
                  }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {completedMilestones} {t('completed')}
                </span>
                <span className="text-slate-500">
                  {totalMilestones - completedMilestones} {t('remaining')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverviewCard;
