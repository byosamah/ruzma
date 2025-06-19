
import React, { useState } from "react";
import DeliverableWatermarkedPreview from "@/components/MilestoneCard/DeliverableWatermarkedPreview";
import { Button } from "@/components/ui/button";
import { Eye, Shield } from "lucide-react";
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
  const t = useT();

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
          <span className="ml-1">{open ? t('hidePreview') : t('showPreview')}</span>
        </Button>
        <div className="flex items-center gap-1 text-xs text-slate-600 select-none">
          <Shield className="w-3 h-3" />
          <span>{watermarkText ? t('securePreview') : t('securePreview')}</span>
        </div>
      </div>
      {open && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <DeliverableWatermarkedPreview
            fileUrl={deliverableUrl}
            watermarkText={watermarkText || t('pendingPayment')}
            fileType={getDeliverableFileType(deliverableName, deliverableUrl)}
          />
        </div>
      )}
    </div>
  );
};

export default MilestoneDeliverablePreview;
