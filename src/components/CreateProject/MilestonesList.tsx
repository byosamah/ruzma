
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { CreateProjectFormData } from '@/lib/validators/project';
import { useUserCurrency } from '@/hooks/useUserCurrency';

interface MilestonesListProps {
  user?: any;
}

const MilestonesList: React.FC<MilestonesListProps> = ({ user }) => {
  const t = useT();
  const { control } = useFormContext<CreateProjectFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  });
  
  const { currency, formatCurrency } = useUserCurrency(user);

  const addMilestone = () => {
    append({ title: '', description: '', price: 0, start_date: '', end_date: '' });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{t('projectMilestones')}</h3>
          <Button 
            type="button" 
            onClick={addMilestone} 
            variant="ghost" 
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs font-medium"
          >
            <Plus className="w-3 h-3 mr-1" />
            {t('addMilestone')}
          </Button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-gray-100 rounded-lg p-4 space-y-4 bg-gray-50/30">
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
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 h-auto"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-9"
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
                        className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`milestones.${index}.start_date`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700">{t('startDate')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-9"
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
                        className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm h-9"
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
