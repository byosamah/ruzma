
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Target, CheckCircle } from 'lucide-react';
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
  const secondaryColor = branding?.secondary_color || '#1D3770';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
      <div 
        className="h-2 w-full"
        style={{ 
          background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
        }}
      />
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-6">
          {/* Project Title and Description */}
          <div>
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-3"
              style={{ color: primaryColor }}
            >
              {projectName}
            </h2>
            <p className="text-slate-600 leading-relaxed">{projectBrief}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 lg:grid-cols-4 gap-6'}`}>
            {/* Total Value */}
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign 
                  className="w-6 h-6 mr-2" 
                  style={{ color: primaryColor }} 
                />
                <span className="text-sm font-medium text-slate-600">{t('totalValue')}</span>
              </div>
              <div 
                className="text-xl font-bold"
                style={{ color: primaryColor }}
              >
                {formatCurrency(totalValue, freelancerCurrency || currency)}
              </div>
              {freelancerCurrency && freelancerCurrency !== currency && (
                <div className="text-xs text-slate-500 mt-1">
                  ({formatCurrency(totalValue, currency)})
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target 
                  className="w-6 h-6 mr-2" 
                  style={{ color: primaryColor }} 
                />
                <span className="text-sm font-medium text-slate-600">{t('progress')}</span>
              </div>
              <div 
                className="text-xl font-bold"
                style={{ color: primaryColor }}
              >
                {completedMilestones}/{totalMilestones}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {Math.round(progressPercentage)}% {t('complete')}
              </div>
            </div>

            {/* Start Date */}
            {startDate && (
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar 
                    className="w-6 h-6 mr-2" 
                    style={{ color: primaryColor }} 
                  />
                  <span className="text-sm font-medium text-slate-600">{t('startDate')}</span>
                </div>
                <div 
                  className="text-lg font-semibold"
                  style={{ color: primaryColor }}
                >
                  {formatDate(startDate)}
                </div>
              </div>
            )}

            {/* End Date */}
            {endDate && (
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar 
                    className="w-6 h-6 mr-2" 
                    style={{ color: primaryColor }} 
                  />
                  <span className="text-sm font-medium text-slate-600">{t('deadline')}</span>
                </div>
                <div 
                  className="text-lg font-semibold"
                  style={{ color: primaryColor }}
                >
                  {formatDate(endDate)}
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">{t('overallProgress')}</span>
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ 
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}40`
                }}
              >
                {Math.round(progressPercentage)}% {t('complete')}
              </Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                  background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{completedMilestones} {t('completed')}</span>
              <span>{totalMilestones - completedMilestones} {t('remaining')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverviewCard;
