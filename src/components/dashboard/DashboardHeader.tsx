
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Template } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          {t("welcomeBack", { name: displayName })}
        </h1>
        <p className="text-slate-600 mt-1">{t("dashboardSubtitle")}</p>
      </div>
      <div className="flex gap-3">
        <Button 
          onClick={() => navigate("/templates")} 
          variant="outline"
          className="flex items-center"
        >
          <Template className="w-4 h-4 mr-2" />
          Templates
        </Button>
        <Button onClick={onNewProject} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          {t("newProject")}
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
