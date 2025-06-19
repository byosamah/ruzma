import React, { useState } from "react";
import DeliverableWatermarkedPreview from "@/components/MilestoneCard/DeliverableWatermarkedPreview";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useT } from "@/lib/i18n";
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
  if (lowered.endsWith(".jpg") || lowered.endsWith(".jpeg") || lowered.endsWith(".png")) return "image/jpeg";
  return "";
};
const MilestoneDeliverablePreview: React.FC<MilestoneDeliverablePreviewProps> = ({
  milestoneId,
  deliverableUrl,
  deliverableName,
  status,
  watermarkText
}) => {
  const [open, setOpen] = useState(false);
  const t = useT();
  if (!deliverableUrl || !deliverableName || status === "approved") {
    return null;
  }
  return <div>
      
      {open && <DeliverableWatermarkedPreview fileUrl={deliverableUrl} watermarkText={watermarkText || t('pendingPayment')} fileType={getDeliverableFileType(deliverableName, deliverableUrl)} />}
    </div>;
};
export default MilestoneDeliverablePreview;