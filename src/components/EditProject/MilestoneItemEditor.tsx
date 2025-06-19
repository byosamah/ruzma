
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { MilestoneFormData } from './types';
import { useT } from '@/lib/i18n';

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
  const t = useT();
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
        <label htmlFor={`milestone-title-${index}`} className="text-sm font-medium text-slate-700">{t('title')}</label>
        <Input
          id={`milestone-title-${index}`}
          value={milestone.title}
          onChange={(e) => onMilestoneChange(index, 'title', e.target.value)}
          placeholder={t('milestoneTitlePlaceholder_edit')}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor={`milestone-desc-${index}`} className="text-sm font-medium text-slate-700">{t('description')}</label>
        <Textarea
          id={`milestone-desc-${index}`}
          value={milestone.description}
          onChange={(e) => onMilestoneChange(index, 'description', e.target.value)}
          placeholder={t('milestoneDescriptionPlaceholder_edit')}
          required
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor={`milestone-price-${index}`} className="text-sm font-medium text-slate-700">{t('price')}</label>
          <Input
            id={`milestone-price-${index}`}
            type="number"
            value={milestone.price}
            onChange={(e) => onMilestoneChange(index, 'price', e.target.value)}
            placeholder={t('milestonePricePlaceholder_edit')}
            required
            min="0"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`milestone-start-date-${index}`} className="text-sm font-medium text-slate-700">Start Date</label>
          <Input
            id={`milestone-start-date-${index}`}
            type="date"
            value={milestone.start_date || ''}
            onChange={(e) => onMilestoneChange(index, 'start_date', e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor={`milestone-end-date-${index}`} className="text-sm font-medium text-slate-700">End Date</label>
        <Input
          id={`milestone-end-date-${index}`}
          type="date"
          value={milestone.end_date || ''}
          onChange={(e) => onMilestoneChange(index, 'end_date', e.target.value)}
        />
      </div>
    </div>
  );
};
