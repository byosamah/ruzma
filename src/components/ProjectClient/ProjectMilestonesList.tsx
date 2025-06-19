
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import MilestoneCard from "@/components/MilestoneCard";
import MilestoneDeliverablePreview from "@/components/ProjectClient/MilestoneDeliverablePreview";
import { DatabaseMilestone } from "@/hooks/useProjects";
import { CurrencyCode } from "@/lib/currency";
import { useT } from "@/lib/i18n";

interface ProjectMilestonesListProps {
  milestones: DatabaseMilestone[];
  onPaymentUpload: (milestoneId: string, file: File) => void;
  onDeliverableDownload: (milestoneId: string) => void;
  currency: CurrencyCode;
}

const ProjectMilestonesList: React.FC<ProjectMilestonesListProps> = ({
  milestones,
  onPaymentUpload,
  onDeliverableDownload,
  currency,
}) => {
  const t = useT();
  return (
    <div className="relative">
      {/* Sticky Preview Container */}
      <MilestoneDeliverablePreview
        milestones={milestones}
      />
      
      {/* Milestones List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">{t('projectMilestones')}</h2>
          <div className="text-sm text-slate-500">
            {milestones.length} {milestones.length === 1 ? 'milestone' : 'milestones'}
          </div>
        </div>
        
        <div className="space-y-6">
          {milestones.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-slate-400 text-lg mb-2">📋</div>
                <p className="text-slate-500 font-medium">{t('noMilestonesSetup')}</p>
              </CardContent>
            </Card>
          ) : (
            milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative">
                {/* Timeline connector */}
                {index > 0 && (
                  <div className="absolute -top-6 left-8 w-0.5 h-6 bg-gradient-to-b from-slate-200 to-transparent"></div>
                )}
                
                {/* Milestone number badge */}
                <div className="absolute -left-2 top-6 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600 shadow-sm z-10">
                  {index + 1}
                </div>
                
                {/* Milestone card with left margin for the badge */}
                <div className="ml-8 relative">
                  <MilestoneCard
                    milestone={{
                      id: milestone.id,
                      title: milestone.title,
                      description: milestone.description,
                      price: milestone.price,
                      status: milestone.status,
                      deliverable: milestone.deliverable_name ? {
                        name: milestone.deliverable_name,
                        size: milestone.deliverable_size || 0,
                        url: milestone.deliverable_url
                      } : undefined,
                      paymentProofUrl: milestone.payment_proof_url,
                      watermarkText: milestone.watermark_text ?? undefined,
                    }}
                    isClient={true}
                    onPaymentUpload={onPaymentUpload}
                    onDeliverableDownload={onDeliverableDownload}
                    currency={currency}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectMilestonesList;
