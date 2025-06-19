
import React, { useState } from "react";
import DeliverableWatermarkedPreview from "@/components/MilestoneCard/DeliverableWatermarkedPreview";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { DatabaseMilestone } from "@/hooks/useProjects";

interface MilestoneDeliverablePreviewProps {
  milestones: DatabaseMilestone[];
}

const getDeliverableFileType = (name?: string, url?: string) => {
  if (!name && !url) return "";
  const lowered = (name || url || "").toLowerCase();
  if (lowered.endsWith(".pdf")) return "application/pdf";
  if (lowered.endsWith(".jpg") || lowered.endsWith(".jpeg") || lowered.endsWith(".png")) return "image/jpeg";
  return "";
};

const MilestoneDeliverablePreview: React.FC<MilestoneDeliverablePreviewProps> = ({
  milestones
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<DatabaseMilestone | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const t = useT();

  // Find milestones with deliverables that aren't approved yet
  const previewableMilestones = milestones.filter(m => 
    m.deliverable_url && 
    m.deliverable_name && 
    m.status !== "approved"
  );

  if (previewableMilestones.length === 0) {
    return null;
  }

  const handleShowPreview = (milestone: DatabaseMilestone) => {
    setSelectedMilestone(milestone);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedMilestone(null);
  };

  return (
    <>
      {/* Preview buttons for each milestone */}
      <div className="mb-6 space-y-2">
        {previewableMilestones.map((milestone) => (
          <div key={milestone.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600 flex-1">
              Preview: {milestone.title}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShowPreview(milestone)}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Show Preview
            </Button>
          </div>
        ))}
      </div>

      {/* Sticky Preview Box */}
      {isPreviewOpen && selectedMilestone && (
        <div className="fixed top-4 right-4 w-96 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[80vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">
              {selectedMilestone.title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClosePreview}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-4">
            <div className="mb-2 text-xs text-slate-500 text-center">
              {selectedMilestone.watermark_text ? 
                `Watermarked: ${selectedMilestone.watermark_text}` : 
                'Watermarked: Pending Payment'
              }
            </div>
            <DeliverableWatermarkedPreview
              fileUrl={selectedMilestone.deliverable_url!}
              watermarkText={selectedMilestone.watermark_text || t('pendingPayment')}
              fileType={getDeliverableFileType(selectedMilestone.deliverable_name, selectedMilestone.deliverable_url)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MilestoneDeliverablePreview;
