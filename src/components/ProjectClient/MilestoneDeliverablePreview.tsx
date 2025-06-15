
import React, { useState } from "react";
import DeliverableWatermarkedPreview from "@/components/MilestoneCard/DeliverableWatermarkedPreview";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface MilestoneDeliverablePreviewProps {
  milestoneId: string;
  deliverableUrl?: string;
  deliverableName?: string;
  status: string;
  watermarkText?: string;
}

const getDeliverableFileType = (name?: string, url?: string) => {
  if (!name && !url) return "";
  const lowered = (name || url || "").toLowerCase();
  if (lowered.endsWith(".pdf")) return "application/pdf";
  if (lowered.endsWith(".jpg") || lowered.endsWith(".jpeg") || lowered.endsWith(".png"))
    return "image/jpeg";
  return "";
};

const MilestoneDeliverablePreview: React.FC<MilestoneDeliverablePreviewProps> = ({
  milestoneId,
  deliverableUrl,
  deliverableName,
  status,
  watermarkText,
}) => {
  const [open, setOpen] = useState(false);

  if (!deliverableUrl || !deliverableName || status === "approved") {
    return null;
  }

  return (
    <div>
      <div className="flex items-center mb-1 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => setOpen((o) => !o)}
        >
          <Eye className="w-4 h-4" />
          <span className="ml-1">{open ? "Hide" : "Show"} Preview</span>
        </Button>
        <span className="text-xs text-slate-600 select-none">
          {watermarkText ? `(Watermarked)` : ""}
        </span>
      </div>
      {open && (
        <DeliverableWatermarkedPreview
          fileUrl={deliverableUrl}
          watermarkText={watermarkText || "Pending Payment"}
          fileType={getDeliverableFileType(deliverableName, deliverableUrl)}
        />
      )}
    </div>
  );
};

export default MilestoneDeliverablePreview;
