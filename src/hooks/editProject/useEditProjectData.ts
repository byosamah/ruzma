
import { useState, useEffect } from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { MilestoneFormData } from '@/components/EditProject/types';

export const useEditProjectData = (
  projects: DatabaseProject[],
  projectId: string | undefined
) => {
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [milestones, setMilestones] = useState<MilestoneFormData[]>([]);

  useEffect(() => {
    if (projects.length > 0 && projectId) {
      const projectToEdit = projects.find(p => p.id === projectId);
      if (projectToEdit) {
        setProject(projectToEdit);
        setName(projectToEdit.name);
        setBrief(projectToEdit.brief);
        setMilestones(projectToEdit.milestones.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          price: m.price,
          status: m.status,
        })));
      }
    }
  }, [projects, projectId]);

  return {
    project,
    name,
    brief,
    milestones,
    setName,
    setBrief,
    setMilestones,
  };
};
