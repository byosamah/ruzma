
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import MilestoneCard from "@/components/MilestoneCard";
import MilestoneDeliverablePreview from "@/components/ProjectClient/MilestoneDeliverablePreview";
import { DatabaseMilestone } from "@/hooks/useProjects";

interface ProjectMilestonesListProps {
  milestones: DatabaseMilestone[];
  onPaymentUpload: (milestoneId: string, file: File) => void;
  onDeliverableDownload: (milestoneId: string) => void;
}

const ProjectMilestonesList: React.FC<ProjectMilestonesListProps> = ({
  milestones,
  onPaymentUpload,
  onDeliverableDownload,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Project Milestones</h2>
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-slate-500">No milestones have been set up for this project yet.</p>
            </CardContent>
          </Card>
        ) : (
          milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {index > 0 && (
                <div className="absolute -top-4 left-6 w-0.5 h-4 bg-slate-300"></div>
              )}
              <div className="mb-2">
                <MilestoneDeliverablePreview
                  milestoneId={milestone.id}
                  deliverableUrl={milestone.deliverable_url}
                  deliverableName={milestone.deliverable_name}
                  status={milestone.status}
                  watermarkText={milestone.watermark_text ?? undefined}
                />
              </div>
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
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectMilestonesList;
