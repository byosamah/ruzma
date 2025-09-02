
import { useState, useEffect } from 'react';
import { useProjects } from './useProjects';
import { DatabaseProject } from './projectTypes';
import { useDashboard } from './useDashboard';
import { useUserCurrency } from './useUserCurrency';

import { parseRevisionData, addRevisionRequest, stringifyRevisionData } from '@/lib/revisionUtils';
import { ProjectService } from '@/services/projectService';

export const useProjectManagement = (slug: string | undefined) => {
  const { user, profile } = useDashboard();
  const { projects, loading, fetchProjects } = useProjects(user);
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const userCurrency = useUserCurrency(profile);

  // Get project service from useProjects hook
  const { createProject, updateProject, deleteProject } = useProjects(user);

  // Milestone actions using the project service directly
  const updateMilestoneStatus = async (
    milestoneId: string,
    status: 'approved' | 'rejected'
  ) => {
    const projectService = new ProjectService(user);
    const result = await projectService.updateMilestoneStatus(projects, milestoneId, status);
    if (result) {
      fetchProjects();
    }
  };

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    const projectService = new ProjectService(user);
    const result = await projectService.uploadPaymentProof(milestoneId, file);
    if (result) {
      fetchProjects();
    }
  };

  const updateDeliverableLink = async (milestoneId: string, link: string) => {
    const projectService = new ProjectService(user);
    const result = await projectService.updateDeliverableLink(milestoneId, link);
    if (result) {
      fetchProjects();
    }
  };

  const updateMilestoneStatusGeneric = async (
    milestoneId: string,
    status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  ) => {
    const projectService = new ProjectService(user);
    const result = await projectService.updateMilestoneStatusGeneral(milestoneId, status);
    if (result) {
      fetchProjects();
    }
  };

  const updateRevisionData = async (milestoneId: string, newDeliverableLink: string) => {
    const projectService = new ProjectService(user);
    const result = await projectService.updateRevisionData(milestoneId, newDeliverableLink);
    if (result) {
      fetchProjects();
    }
  };

  const addRevisionRequestClient = async (milestoneId: string, feedback: string, images: string[]) => {
    // Find the milestone to get current deliverable_link
    const milestone = projects
      .flatMap(p => p.milestones)
      .find(m => m.id === milestoneId);
    
    if (!milestone) {
      return;
    }

    const currentRevisionData = parseRevisionData(milestone);
    const updatedRevisionData = addRevisionRequest(currentRevisionData, feedback, images);
    const newDeliverableLink = stringifyRevisionData(milestone.deliverable_link, updatedRevisionData);
    
    const projectService = new ProjectService(user);
    const result = await projectService.addRevisionRequest(milestoneId, newDeliverableLink);
    if (result) {
      fetchProjects();
    }
  };

  useEffect(() => {
    if (projects.length > 0 && slug) {
      const found = projects.find((p) => p.slug === slug);
      if (found) {
        setProject(found);
      }
    }
  }, [projects, slug]);

  return {
    user,
    profile,
    project,
    projects,
    loading,
    fetchProjects,
    userCurrency,
    updateMilestoneStatus,
    uploadPaymentProof,
    updateDeliverableLink,
    updateMilestoneStatusGeneric,
    updateRevisionData,
    addRevisionRequestClient,
  };
};
