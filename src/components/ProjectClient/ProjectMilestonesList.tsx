
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
    <Card className="bg-white shadow-sm border border-slate-100">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Target 
              className="w-5 h-5" 
              style={{ color: primaryColor }} 
            />
          </div>
          {t('projectMilestones')}
        </CardTitle>
        <p className="text-slate-600 mt-2">
          {t('trackMilestoneProgressAndPayments')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative">
            {/* Connection Line */}
            {index > 0 && (
              <div 
                className="absolute -top-3 left-6 w-0.5 h-3 z-0"
                style={{ backgroundColor: `${primaryColor}20` }}
              />
            )}
            
            {/* Milestone Card */}
            <div className="relative z-10">
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
          </div>
        ))}
        
        {/* Empty State */}
        {milestones.length === 0 && (
          <div className="text-center py-16">
            <div 
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}10` }}
            >
              <Target 
                className="w-8 h-8" 
                style={{ color: `${primaryColor}60` }} 
              />
            </div>
            <p className="text-slate-500 text-lg">{t('noMilestonesFound')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectMilestonesList;
