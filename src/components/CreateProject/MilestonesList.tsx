
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// Icons replaced with emojis
import { useT } from '@/lib/i18n';
import { CreateProjectFormData } from '@/lib/validators/project';
import { useUserCurrency } from '@/hooks/useUserCurrency';

interface MilestonesListProps {
  user?: any;
  profile?: any;
}

const MilestonesList: React.FC<MilestonesListProps> = ({ user, profile }) => {
  const t = useT();
  const { control } = useFormContext<CreateProjectFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  });
  
  const { currency, formatCurrency } = useUserCurrency(profile);

  const addMilestone = () => {
    append({ title: '', description: '', price: 0, start_date: '', end_date: '' });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">{t('projectMilestones')}</h3>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-gray-100 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50/30">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-800">
                {t('milestoneLabel', { index: (index + 1).toString() })}
              </h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 h-auto mobile-touch-target"
                >
                  <span className="text-base sm:text-sm">🗑️</span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={control}
                name={`milestones.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700">
                      {t('milestoneTitleLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('milestoneTitlePlaceholder')} 
                        className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-10 sm:h-9"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`milestones.${index}.price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700">
                      {t('priceLabel', { currency })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-10 sm:h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={control}
                name={`milestones.${index}.start_date`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700">{t('startDate')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-10 sm:h-9"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`milestones.${index}.end_date`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700">{t('endDate')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-10 sm:h-9"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={control}
              name={`milestones.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700">
                    {t('descriptionLabel')}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('milestoneDescriptionPlaceholder')} 
                      rows={2} 
                      className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        
        {/* Add Milestone Button - Now positioned after all milestones */}
        <div className="flex justify-center pt-2 sm:pt-4">
          <Button 
            type="button" 
            onClick={addMilestone} 
            variant="outline" 
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm font-medium mobile-touch-target"
          >
            <span className="text-base sm:text-lg mr-2">➕</span>
            {t('addMilestone')}
          </Button>
        </div>
        
        <FormField
          control={control}
          name="milestones"
          render={() => (
             <FormItem>
               <FormMessage />
             </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default MilestonesList;
