
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Target, DollarSign } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { format } from 'date-fns';
import { FreelancerBranding } from '@/types/branding';

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

const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({
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

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Project Title and Brief */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {projectName}
            </h2>
            {projectBrief && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {projectBrief}
              </p>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('totalValue')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(totalValue, currency)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t('progress')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {completedMilestones}/{totalMilestones} {t('milestones')}
                </p>
              </div>
            </div>

            {(startDate || endDate) && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{t('timeline')}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {startDate && endDate 
                      ? `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d')}`
                      : startDate 
                        ? `${t('starts')} ${format(new Date(startDate), 'MMM d, yyyy')}`
                        : endDate 
                          ? `${t('ends')} ${format(new Date(endDate), 'MMM d, yyyy')}`
                          : t('noDateSet')
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">{t('projectProgress')}</span>
              <span className="text-xs text-gray-600 font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverviewCard;
