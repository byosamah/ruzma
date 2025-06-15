
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { MilestoneFormData } from './types';

interface MilestoneItemEditorProps {
  milestone: MilestoneFormData;
  index: number;
  onMilestoneChange: (index: number, field: keyof MilestoneFormData, value: string | number) => void;
  onDeleteMilestone: (index: number) => void;
}

export const MilestoneItemEditor: React.FC<MilestoneItemEditorProps> = ({
  milestone,
  index,
  onMilestoneChange,
  onDeleteMilestone,
}) => {
  return (
    <div className="p-4 border rounded-md space-y-3 bg-slate-50 relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 text-slate-500 hover:bg-red-100 hover:text-red-600"
        onClick={() => onDeleteMilestone(index)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <div className="space-y-2">
        <label htmlFor={`milestone-title-${index}`} className="text-sm font-medium text-slate-700">Title</label>
        <Input
          id={`milestone-title-${index}`}
          value={milestone.title}
          onChange={(e) => onMilestoneChange(index, 'title', e.target.value)}
          placeholder="e.g. Phase 1: Discovery"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={`milestone-desc-${index}`} className="text-sm font-medium text-slate-700">Description</label>
        <Textarea
          id={`milestone-desc-${index}`}
          value={milestone.description}
          onChange={(e) => onMilestoneChange(index, 'description', e.target.value)}
          placeholder="Briefly describe this milestone"
          required
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={`milestone-price-${index}`} className="text-sm font-medium text-slate-700">Price ($)</label>
        <Input
          id={`milestone-price-${index}`}
          type="number"
          value={milestone.price}
          onChange={(e) => onMilestoneChange(index, 'price', e.target.value)}
          placeholder="e.g. 500"
          required
          min="0"
        />
      </div>
    </div>
  );
};
