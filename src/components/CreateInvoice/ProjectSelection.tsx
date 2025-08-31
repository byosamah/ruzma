
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceFormData } from './types';
import { useAuth } from '@/hooks/core/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useT } from '@/lib/i18n';

interface ProjectSelectionProps {
  invoiceData: InvoiceFormData;
  updateField: (field: keyof InvoiceFormData, value: string | number | boolean | Date) => void;
}

const ProjectSelection: React.FC<ProjectSelectionProps> = ({
  invoiceData,
  updateField
}) => {
  const t = useT();
  const { user } = useAuth();
  const { projects, loading } = useProjects(user);

  // Get active projects (projects that have milestones and are not completed)
  const activeProjects = projects.filter(project => 
    project.milestones?.length
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Project</label>
          <Select
            value={invoiceData.projectId || ''}
            onValueChange={(value) => updateField('projectId', value)}
          >
            <SelectTrigger className="border-gray-300 border">
              <SelectValue placeholder={t('selectProject')} />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>{t('loadingProjects')}</SelectItem>
              ) : activeProjects.length ? (
                activeProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-projects" disabled>{t('noActiveProjectsFound')}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSelection;
