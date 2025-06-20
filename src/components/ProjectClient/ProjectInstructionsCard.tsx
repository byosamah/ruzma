
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

  const instructions = [
    {
      icon: CreditCard,
      title: t('submitPaymentProof'),
      description: t('uploadPaymentProofForEachMilestone'),
    },
    {
      icon: CheckCircle,
      title: t('waitForApproval'),
      description: t('freelancerWillReviewAndApprovePayment'),
    },
    {
      icon: Download,
      title: t('downloadDeliverables'),
      description: t('onceApprovedDownloadYourFiles'),
    }
  ];

  return (
    <Card className="bg-white shadow-sm border border-slate-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Info className="w-4 h-4" style={{ color: primaryColor }} />
          </div>
          {t('howItWorks')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {instructions.map((instruction, index) => {
            const IconComponent = instruction.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Step Number */}
                <div className="absolute -top-1 -left-1 z-10">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {index + 1}
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:shadow-sm transition-all duration-200 h-full">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <IconComponent 
                        className="w-6 h-6" 
                        style={{ color: primaryColor }} 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <h4 
                        className="font-semibold text-sm"
                        style={{ color: primaryColor }}
                      >
                        {instruction.title}
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed">
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
