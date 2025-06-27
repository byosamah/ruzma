
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MilestoneFormData } from '@/components/EditProject/types';

export const useEditProjectActions = (
  updateProject: (projectId: string, data: any) => Promise<boolean>
) => {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  const handleMilestoneChange = (
    milestones: MilestoneFormData[],
    setMilestones: (milestones: MilestoneFormData[]) => void,
    index: number,
    field: keyof MilestoneFormData,
    value: string | number
  ) => {
    const newMilestones = [...milestones];
    const milestoneToUpdate = { ...newMilestones[index] };

    if (field === 'price') {
      milestoneToUpdate[field] = parseFloat(value as string) || 0;
    } else {
      (milestoneToUpdate as any)[field] = value;
    }
    newMilestones[index] = milestoneToUpdate;
    setMilestones(newMilestones);
  };

  const handleAddMilestone = (
    milestones: MilestoneFormData[],
    setMilestones: (milestones: MilestoneFormData[]) => void
  ) => {
    setMilestones([
      ...milestones,
      {
        title: '',
        description: '',
        price: 0,
        status: 'pending',
      },
    ]);
  };

  const handleDeleteMilestone = (
    milestones: MilestoneFormData[],
    setMilestones: (milestones: MilestoneFormData[]) => void,
    index: number
  ) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (
    e: React.FormEvent,
    projectId: string | undefined,
    projectSlug: string | undefined,
    name: string,
    brief: string,
    clientEmail: string,
    paymentProofRequired: boolean,
    milestones: MilestoneFormData[]
  ) => {
    e.preventDefault();
    if (!projectId) return;

    // Validate milestones
    for (const milestone of milestones) {
      if (!milestone.title.trim() || !milestone.description.trim()) {
        toast.error('Milestone title and description cannot be empty.');
        return;
      }
      if (milestone.price <= 0) {
        toast.error('Milestone price must be greater than 0.');
        return;
      }
    }

    if (milestones.length === 0) {
      toast.error('At least one milestone is required.');
      return;
    }

    setUpdating(true);
    
    try {
      const success = await updateProject(projectId, {
        name,
        brief,
        clientEmail,
        paymentProofRequired,
        milestones,
      });

      if (success) {
        toast.success('Project updated successfully!');
        // Navigate back to the project management page instead of dashboard
        if (projectSlug) {
          navigate(`/project/${projectSlug}`);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return {
    updating,
    handleMilestoneChange,
    handleAddMilestone,
    handleDeleteMilestone,
    handleSubmit,
  };
};
