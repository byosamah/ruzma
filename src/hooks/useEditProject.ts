
import { useProjects } from '@/hooks/useProjects';
import { useEditProjectAuth } from './editProject/useEditProjectAuth';
import { useEditProjectData } from './editProject/useEditProjectData';
import { useEditProjectActions } from './editProject/useEditProjectActions';

export const useEditProject = (projectId: string | undefined) => {
  const { user, profile, loading, handleSignOut } = useEditProjectAuth(projectId);
  const { projects, updateProject } = useProjects(user);
  
  const {
    project,
    name,
    brief,
    milestones,
    setName,
    setBrief,
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
  const wrappedHandleMilestoneChange = (index: number, field: keyof any, value: string | number) => {
    handleMilestoneChange(milestones, setMilestones, index, field, value);
  };

  const wrappedHandleAddMilestone = () => {
    handleAddMilestone(milestones, setMilestones);
  };

  const wrappedHandleDeleteMilestone = (index: number) => {
    handleDeleteMilestone(milestones, setMilestones, index);
  };

  const wrappedHandleSubmit = (e: React.FormEvent) => {
    handleSubmit(e, projectId, name, brief, milestones);
  };

  return {
    user,
    profile,
    project,
    name,
    brief,
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
  };
};
