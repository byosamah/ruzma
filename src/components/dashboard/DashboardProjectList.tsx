import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProjectCard from "@/components/ProjectCard";
import { Plus, Briefcase } from "lucide-react";
import { DatabaseProject } from "@/hooks/projectTypes";
import { useT } from "@/lib/i18n";

interface DashboardProjectListProps {
  projects: DatabaseProject[];
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onNewProject: () => void;
}

const DashboardProjectList: React.FC<DashboardProjectListProps> = ({
  projects,
  onEdit,
  onDelete,
  onNewProject,
}) => {
  const t = useT();
  
  const handleViewProject = (projectId: string) => {
    // Navigate to correct project management route
    window.location.href = `/project/${projectId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {t("yourProjects")}
        </h2>
        {projects.length === 0 && (
          <Button onClick={onNewProject} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            {t("createFirstProject")}
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
          <CardContent>
            <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {t("noProjectsYet")}
            </h3>
            <p className="text-slate-600 mb-6">{t("createFirstProjectDesc")}</p>
            <Button onClick={onNewProject}>
              <Plus className="w-4 h-4 mr-2" />
              {t("createProject")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewClick={handleViewProject}
              onEditClick={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardProjectList;
