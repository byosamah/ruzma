import React from "react";
import { Button } from "@/components/ui/button";
import StatusPill from "@/components/MilestoneCard/StatusPill";
import { useT } from "@/lib/i18n";
import { DatabaseProject } from "@/hooks/projectTypes";

interface StickyNextStepBarProps {
  project: DatabaseProject;
}

function StickyNextStepBar({ project }: StickyNextStepBarProps) {
  const t = useT();

  // Find the first milestone that is not approved
  const nextMilestone = React.useMemo(() => {
    return project.milestones.find((m) => m.status !== "approved") || null;
  }, [project.milestones]);

  if (!nextMilestone) return null;

  const isPaymentRequired = Boolean(project.payment_proof_required);

  const getCtaLabel = () => {
    if (isPaymentRequired) {
      if (nextMilestone.status === "pending" || nextMilestone.status === "rejected") {
        return t("uploadPaymentProof");
      }
      if (nextMilestone.status === "payment_submitted") {
        return t("waitForApproval");
      }
    } else {
      if (nextMilestone.deliverable_link) return t("downloadDeliverables");
    }
    return t("projectMilestones");
  };

  const isDisabled = nextMilestone.status === "payment_submitted";

  const handleClick = () => {
    const el = document.getElementById(`milestone-${nextMilestone.id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="sticky-next-step-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <div className="hidden sm:block text-sm text-muted-foreground truncate">
            {t("projectMilestones")}:
          </div>
          <div className="truncate text-sm font-medium text-foreground">
            {nextMilestone.title}
          </div>
          <StatusPill status={nextMilestone.status} className="" />
        </div>
        <div className="shrink-0">
          <Button size="sm" onClick={handleClick} disabled={isDisabled}>
            {getCtaLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyNextStepBar;
