
import { User } from '@supabase/supabase-js';
import { DatabaseProject, DatabaseMilestone } from './projectTypes';
import { ProjectService } from '@/services/projectService';
import { useUserProjects } from './projects/useUserProjects';
import { useProfileQuery } from './core/useProfileQuery';

export const useProjects = (user: User | null) => {
  const { projects, loading, fetchProjects } = useUserProjects(user);
  const { data: userProfile } = useProfileQuery(user);
  const projectService = new ProjectService(user);

  // Milestone actions using the project service
  const updateMilestoneStatus = async (
    milestoneId: string,
    status: 'approved' | 'rejected'
  ) => {
    const result = await projectService.updateMilestoneStatus(projects, milestoneId, status);
    if (result) {
      fetchProjects();
    }
  };

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    const result = await projectService.uploadPaymentProof(milestoneId, file);
    if (result) {
      fetchProjects();
    }
  };

  const updateDeliverableLink = async (milestoneId: string, link: string) => {
    const result = await projectService.updateDeliverableLink(milestoneId, link);
    if (result) {
      fetchProjects();
    }
  };

  return {
    projects,
    loading,
    userProfile,
    fetchProjects,
    createProject: projectService.createProject.bind(projectService),
    updateProject: projectService.updateProject.bind(projectService),
    deleteProject: projectService.deleteProject.bind(projectService),
    updateMilestoneStatus,
    uploadPaymentProof,
    updateDeliverableLink,
  };
};

export type { DatabaseProject, DatabaseMilestone };
