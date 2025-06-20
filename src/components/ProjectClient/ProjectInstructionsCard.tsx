
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, CreditCard, Download, CheckCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';

const ProjectInstructionsCard: React.FC = () => {
  const t = useT();

  const instructions = [
    {
      icon: CreditCard,
      title: t('submitPaymentProof'),
      description: t('uploadPaymentProofForEachMilestone'),
      color: '#10B981'
    },
    {
      icon: CheckCircle,
      title: t('waitForApproval'),
      description: t('freelancerWillReviewAndApprovePayment'),
      color: '#3B82F6'
    },
    {
      icon: Download,
      title: t('downloadDeliverables'),
      description: t('onceApprovedDownloadYourFiles'),
      color: '#8B5CF6'
    }
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-600" />
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          {t('howItWorks')}
        </CardTitle>
        <p className="text-slate-600 mt-1">
          {t('followTheseStepsToTrackYourProject')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
          {instructions.map((instruction, index) => {
            const IconComponent = instruction.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${instruction.color}15` }}
                >
                  <IconComponent 
                    className="w-5 h-5" 
                    style={{ color: instruction.color }} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-semibold text-sm mb-1"
                    style={{ color: instruction.color }}
                  >
                    {instruction.title}
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {instruction.description}
                  </p>
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
