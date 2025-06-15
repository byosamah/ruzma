
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { MilestoneFormData } from './types';
import { MilestoneItemEditor } from './MilestoneItemEditor';

interface ProjectFormProps {
  name: string;
  brief: string;
  milestones: MilestoneFormData[];
  updating: boolean;
  onNameChange: (name: string) => void;
  onBriefChange: (brief: string) => void;
  onMilestoneChange: (index: number, field: keyof MilestoneFormData, value: string | number) => void;
  onAddMilestone: () => void;
  onDeleteMilestone: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  name,
  brief,
  milestones,
  updating,
  onNameChange,
  onBriefChange,
  onMilestoneChange,
  onAddMilestone,
  onDeleteMilestone,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">Project Name</label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. E-commerce Website Design"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="brief" className="text-sm font-medium text-slate-700">Project Brief</label>
        <Textarea
          id="brief"
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
          placeholder="A short description of the project."
          required
          rows={4}
        />
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-medium text-slate-800">Milestones</h3>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <MilestoneItemEditor
              key={index}
              milestone={milestone}
              index={index}
              onMilestoneChange={onMilestoneChange}
              onDeleteMilestone={onDeleteMilestone}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onAddMilestone}
          className="w-full flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={updating}>
          {updating ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
