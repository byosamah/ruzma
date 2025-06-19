
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
  freelancerCurrency?: CurrencyCode;
}

const ProjectMilestonesList: React.FC<ProjectMilestonesListProps> = ({
  milestones,
  onPaymentUpload,
  onDeliverableDownload,
  currency,
  freelancerCurrency,
}) => {
  const t = useT();
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{t('projectMilestones')}</h2>
        <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
      </div>
      
      <div className="space-y-8">
        {milestones.length === 0 ? (
          <Card className="text-center py-12 border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-slate-400">📋</span>
                </div>
                <p className="text-slate-500 text-lg">{t('noMilestonesSetup')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200"></div>
            
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative mb-8 last:mb-0">
                {/* Timeline dot */}
                <div className="absolute left-6 top-8 w-4 h-4 bg-white border-4 border-blue-400 rounded-full z-10 shadow-sm"></div>
                
                {/* Milestone number */}
                <div className="absolute left-4 top-4 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold z-20 shadow-md">
                  {index + 1}
                </div>
                
                <div className="ml-16 space-y-4">
                  {/* Deliverable Preview */}
                  <MilestoneDeliverablePreview
                    milestoneId={milestone.id}
                    deliverableUrl={milestone.deliverable_url}
                    deliverableName={milestone.deliverable_name}
                    status={milestone.status}
                    watermarkText={milestone.watermark_text ?? undefined}
                  />
                  
                  {/* Milestone Card */}
                  <div className="transform transition-all duration-200 hover:translate-x-1">
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
                        start_date: milestone.start_date ?? undefined,
                        end_date: milestone.end_date ?? undefined,
                      }}
                      isClient={true}
                      onPaymentUpload={onPaymentUpload}
                      onDeliverableDownload={onDeliverableDownload}
                      currency={currency}
                      freelancerCurrency={freelancerCurrency}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMilestonesList;
