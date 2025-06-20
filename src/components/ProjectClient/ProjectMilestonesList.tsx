
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Milestone } from '@/components/MilestoneCard/types';
import MilestoneCard from '@/components/MilestoneCard';
import { CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { Target } from 'lucide-react';
import { FreelancerBranding } from '@/types/branding';

interface ProjectMilestonesListProps {
  milestones: Milestone[];
  onPaymentUpload: (milestoneId: string, file: File) => Promise<boolean>;
  onDeliverableDownload: (milestoneId: string) => void;
  currency: CurrencyCode;
  freelancerCurrency?: CurrencyCode | null;
  branding?: FreelancerBranding | null;
}

const ProjectMilestonesList: React.FC<ProjectMilestonesListProps> = ({
  milestones,
  onPaymentUpload,
  onDeliverableDownload,
  currency,
  freelancerCurrency,
  branding,
}) => {
  const t = useT();
  const primaryColor = branding?.primary_color || '#4B72E5';

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
      <div 
        className="h-1 w-full"
        style={{ backgroundColor: primaryColor }}
      />
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Target 
              className="w-5 h-5" 
              style={{ color: primaryColor }} 
            />
          </div>
          {t('projectMilestones')}
        </CardTitle>
        <p className="text-slate-600 mt-1">
          {t('trackMilestoneProgressAndPayments')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative">
            {index > 0 && (
              <div 
                className="absolute -top-3 left-6 w-0.5 h-3"
                style={{ backgroundColor: `${primaryColor}30` }}
              />
            )}
            <MilestoneCard
              milestone={milestone}
              isClient={true}
              onPaymentUpload={onPaymentUpload}
              onDeliverableDownload={onDeliverableDownload}
              currency={currency}
              freelancerCurrency={freelancerCurrency}
              branding={branding}
            />
          </div>
        ))}
        
        {milestones.length === 0 && (
          <div className="text-center py-12">
            <Target 
              className="w-16 h-16 mx-auto mb-4 opacity-20" 
              style={{ color: primaryColor }} 
            />
            <p className="text-slate-500">{t('noMilestonesFound')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectMilestonesList;
