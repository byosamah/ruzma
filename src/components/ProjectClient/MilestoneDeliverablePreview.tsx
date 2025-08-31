
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useT } from "@/lib/i18n";

interface MilestoneDeliverablePreviewProps {
  milestoneId: string;
  deliverableUrl?: string;
  deliverableName?: string;
  status: string;
}

function MilestoneDeliverablePreview({
  milestoneId,
  deliverableUrl,
  deliverableName,
  status
}: MilestoneDeliverablePreviewProps) {
  const [open, setOpen] = useState(false);
  const t = useT();

  if (!deliverableUrl || !deliverableName || status === "approved") {
    return null;
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1"
      >
        <Eye className="w-4 h-4" />
        <span>{t('preview')}</span>
      </Button>
      
      {open && (
        <div className="mt-2 w-full bg-slate-100 min-h-[300px] flex items-center justify-center rounded overflow-hidden">
          {deliverableUrl.endsWith('.pdf') ? (
            <iframe
              src={deliverableUrl}
              title="PDF Preview"
              className="w-full h-[430px] rounded"
            />
          ) : (
            <img
              src={deliverableUrl}
              alt="deliverable"
              className="max-h-[350px] rounded object-contain w-auto mx-auto"
              style={{ width: "100%", height: "auto", opacity: 1, objectFit: "contain" }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MilestoneDeliverablePreview;
