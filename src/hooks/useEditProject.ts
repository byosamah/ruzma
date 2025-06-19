
import { useProjects } from '@/hooks/useProjects';
import { useEditProjectAuth } from './editProject/useEditProjectAuth';
import { useEditProjectData } from './editProject/useEditProjectData';
import { useEditProjectActions } from './editProject/useEditProjectActions';
import { MilestoneFormData } from '@/components/EditProject/types';

export const useEditProject = (projectId: string | undefined) => {
  const { user, profile, loading, handleSignOut } = useEditProjectAuth(projectId);
  const { projects, updateProject } = useProjects(user);
  
  const {
    project,
    name,
    brief,
    clientEmail,
    milestones,
    setName,
    setBrief,
    setClientEmail,
    setMilestones,
  } = useEditProjectData(projects, projectId);

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
    handleSubmit(e, projectId, name, brief, clientEmail, milestones);
  };

  return {
    user,
    profile,
    project,
    name,
    brief,
    clientEmail,
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
  };
};
