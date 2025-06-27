
import { useProjects } from '@/hooks/useProjects';
import { useEditProjectAuth } from './editProject/useEditProjectAuth';
import { useEditProjectData } from './editProject/useEditProjectData';
import { useEditProjectActions } from './editProject/useEditProjectActions';
import { MilestoneFormData } from '@/components/EditProject/types';

export const useEditProject = (slugOrId: string | undefined) => {
  const { user, profile, loading, handleSignOut } = useEditProjectAuth(slugOrId);
  const { projects, updateProject } = useProjects(user);
  
  const {
    project,
    name,
    brief,
    clientEmail,
    paymentProofRequired,
    milestones,
    setName,
    setBrief,
    setClientEmail,
    setPaymentProofRequired,
    setMilestones,
  } = useEditProjectData(projects, slugOrId);

  const {
    updating,
    handleMilestoneChange,
    handleAddMilestone,
    handleDeleteMilestone,
    handleSubmit,
  } = useEditProjectActions(updateProject);

  // Create wrapper functions to pass the current state
  const wrappedHandleMilestoneChange = (index: number, field: keyof MilestoneFormData, value: string | number) => {
    handleMilestoneChange(milestones, setMilestones, index, field, value);
  };

  const wrappedHandleAddMilestone = () => {
    handleAddMilestone(milestones, setMilestones);
  };

  const wrappedHandleDeleteMilestone = (index: number) => {
    handleDeleteMilestone(milestones, setMilestones, index);
  };

  const wrappedHandleSubmit = (e: React.FormEvent) => {
    const projectId = project?.id;
    const projectSlug = project?.slug;
    handleSubmit(e, projectId, projectSlug, name, brief, clientEmail, paymentProofRequired, milestones);
  };

  return {
    user,
    profile,
    project,
    name,
    brief,
    clientEmail,
    paymentProofRequired,
    milestones,
    loading,
    updating,
    handleSignOut,
    handleMilestoneChange: wrappedHandleMilestoneChange,
    handleAddMilestone: wrappedHandleAddMilestone,
    handleDeleteMilestone: wrappedHandleDeleteMilestone,
    handleSubmit: wrappedHandleSubmit,
    setName,
    setBrief,
    setClientEmail,
    setPaymentProofRequired,
  };
};
