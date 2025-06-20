
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, CreditCard, Download, CheckCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';

interface ProjectInstructionsCardProps {
  branding?: FreelancerBranding | null;
}

const ProjectInstructionsCard: React.FC<ProjectInstructionsCardProps> = ({ branding }) => {
  const t = useT();
  const primaryColor = branding?.primary_color || '#4B72E5';
  const secondaryColor = branding?.secondary_color || '#1D3770';

  const instructions = [
    {
      icon: CreditCard,
      title: t('submitPaymentProof'),
      description: t('uploadPaymentProofForEachMilestone'),
      color: primaryColor
    },
    {
      icon: CheckCircle,
      title: t('waitForApproval'),
      description: t('freelancerWillReviewAndApprovePayment'),
      color: secondaryColor
    },
    {
      icon: Download,
      title: t('downloadDeliverables'),
      description: t('onceApprovedDownloadYourFiles'),
      color: primaryColor
    }
  ];

  return (
    <Card className="bg-white shadow-sm border border-slate-100">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Info className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          {t('howItWorks')}
        </CardTitle>
        <p className="text-slate-600 mt-2">
          {t('followTheseStepsToTrackYourProject')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          {instructions.map((instruction, index) => {
            const IconComponent = instruction.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Step Number */}
                <div className="absolute -top-2 -left-2 z-10">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: instruction.color }}
                  >
                    {index + 1}
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all duration-200 h-full">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${instruction.color}15` }}
                    >
                      <IconComponent 
                        className="w-8 h-8" 
                        style={{ color: instruction.color }} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 
                        className="font-bold text-base"
                        style={{ color: instruction.color }}
                      >
                        {instruction.title}
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {instruction.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInstructionsCard;
