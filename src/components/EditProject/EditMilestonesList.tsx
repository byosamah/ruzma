import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { MilestoneFormData } from './types';

interface EditMilestonesListProps {
  milestones: MilestoneFormData[];
  onMilestoneChange: (index: number, field: keyof MilestoneFormData, value: string | number) => void;
  onAddMilestone: () => void;
  onDeleteMilestone: (index: number) => void;
  profile?: any;
}

const EditMilestonesList: React.FC<EditMilestonesListProps> = ({
  milestones,
  onMilestoneChange,
  onAddMilestone,
  onDeleteMilestone,
  profile
}) => {
  const t = useT();
  const { currency } = useUserCurrency(profile);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">{t('projectMilestones')}</h3>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {milestones.map((milestone, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50/30">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-800">
                {t('milestoneLabel', { index: (index + 1).toString() })}
              </h4>
              {milestones.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteMilestone(index)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 h-auto mobile-touch-target"
                >
                  <span className="text-base sm:text-sm">🗑️</span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  {t('milestoneTitleLabel')}
                </label>
                <Input
                  value={milestone.title}
                  onChange={(e) => onMilestoneChange(index, 'title', e.target.value)}
                  placeholder={t('milestoneTitlePlaceholder')}
                  className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-10 sm:h-9"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  {t('priceLabel', { currency })}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={milestone.price}
                  onChange={(e) => onMilestoneChange(index, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-10 sm:h-9"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  {t('startDate')}
                </label>
                <Input
                  type="date"
                  value={milestone.start_date}
                  onChange={(e) => onMilestoneChange(index, 'start_date', e.target.value)}
                  className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-10 sm:h-9"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  {t('endDate')}
                </label>
                <Input
                  type="date"
                  value={milestone.end_date}
                  onChange={(e) => onMilestoneChange(index, 'end_date', e.target.value)}
                  className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-10 sm:h-9"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                {t('descriptionLabel')}
              </label>
              <Textarea
                value={milestone.description}
                onChange={(e) => onMilestoneChange(index, 'description', e.target.value)}
                placeholder={t('milestoneDescriptionPlaceholder')}
                rows={2}
                className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm resize-none"
              />
            </div>
          </div>
        ))}
        
        {/* Add Milestone Button */}
        <div className="flex justify-center pt-2 sm:pt-4">
          <Button 
            type="button" 
            onClick={onAddMilestone} 
            variant="outline" 
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm font-medium mobile-touch-target"
          >
            <span className="text-base sm:text-lg mr-2">➕</span>
            {t('addMilestone')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditMilestonesList;