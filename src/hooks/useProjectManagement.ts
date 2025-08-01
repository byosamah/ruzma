
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useProjects } from './useProjects';
import { DatabaseProject } from './projectTypes';
import { useDashboard } from './useDashboard';
import { useUserCurrency } from './useUserCurrency';
import { useMilestoneManager } from './useMilestoneManager';
import { parseRevisionData, addRevisionRequest, stringifyRevisionData } from '@/lib/revisionUtils';

export const useProjectManagement = (slug: string | undefined) => {
  const { user, profile } = useDashboard();
  const { projects, loading, fetchProjects } = useProjects(user);
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const userCurrency = useUserCurrency(profile);

  // Milestone manager
  const milestoneManager = useMilestoneManager({ 
    user, 
    onRefresh: fetchProjects 
  });

  // Milestone actions using the manager
  const updateMilestoneStatus = async (
    milestoneId: string,
    status: 'approved' | 'rejected'
  ) => {
    await milestoneManager.updateMilestoneStatus(projects, milestoneId, status);
  };

  const uploadPaymentProof = async (milestoneId: string, file: File) => {
    await milestoneManager.uploadPaymentProof(milestoneId, file);
  };

  const updateDeliverableLink = async (milestoneId: string, link: string) => {
    await milestoneManager.updateDeliverableLink(milestoneId, link);
  };

  const updateMilestoneStatusGeneric = async (
    milestoneId: string,
    status: 'pending' | 'payment_submitted' | 'approved' | 'rejected'
  ) => {
    await milestoneManager.updateMilestoneStatusGeneral(milestoneId, status);
  };

  const updateRevisionData = async (milestoneId: string, newDeliverableLink: string) => {
    await milestoneManager.updateRevisionData(milestoneId, newDeliverableLink);
  };

  const addRevisionRequestClient = async (milestoneId: string, feedback: string, images: string[]) => {
    // Find the milestone to get current deliverable_link
    const milestone = projects
      .flatMap(p => p.milestones)
      .find(m => m.id === milestoneId);
    
    if (!milestone) {
      console.error('Milestone not found');
      return;
    }

    const currentRevisionData = parseRevisionData(milestone);
    const updatedRevisionData = addRevisionRequest(currentRevisionData, feedback, images);
    const newDeliverableLink = stringifyRevisionData(milestone.deliverable_link, updatedRevisionData);
    
    await milestoneManager.addRevisionRequest(milestoneId, newDeliverableLink);
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
