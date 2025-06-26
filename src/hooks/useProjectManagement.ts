import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useProjects } from './useProjects';
import { useMilestoneActions } from './useMilestoneActions';
import { DatabaseProject } from './projectTypes';

export const useProjectManagement = (slug: string | undefined) => {
  const { user, projects, loading, fetchProjects, profile } = useProjects(null);
  const [project, setProject] = useState<DatabaseProject | null>(null);

  const {
    updateMilestoneStatus,
    uploadPaymentProof,
    uploadDeliverable,
    updateDeliverableLink,
    downloadDeliverable,
  } = useMilestoneActions(user, projects, fetchProjects);

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
    updateMilestoneStatus,
    uploadPaymentProof,
    uploadDeliverable,
    updateDeliverableLink,
    downloadDeliverable,
  };
};
