
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useT } from "@/lib/i18n";

interface DashboardHeaderProps {
  displayName: string;
  onNewProject: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  displayName,
  onNewProject,
}) => {
  const t = useT();
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          {t("welcomeBack", { name: displayName })}
        </h1>
        <p className="text-slate-600 mt-1">{t("manageProjects")}</p>
      </div>
      <Button onClick={onNewProject} size="lg">
        <Plus className="w-5 h-5 mr-2" />
        {t("newProject")}
      </Button>
    </div>
  );
};

export default DashboardHeader;
