
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { CreateProjectFormData } from '@/lib/validators/project';

const MilestonesList = () => {
  const t = useT();
  const { control } = useFormContext<CreateProjectFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestones',
  });

  const addMilestone = () => {
    append({ title: '', description: '', price: 0 });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('projectMilestones')}</CardTitle>
          <Button type="button" onClick={addMilestone} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('addMilestone')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border border-slate-200 rounded-lg space-y-4 relative">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-slate-800">{t('milestoneLabel', { index: (index + 1).toString() })}</h3>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`milestones.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('milestoneTitleLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('milestoneTitlePlaceholder')} {...field} />
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
                    <FormLabel>{t('priceLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
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
                  <FormLabel>{t('descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('milestoneDescriptionPlaceholder')} rows={3} {...field} />
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
      </CardContent>
    </Card>
  );
};

export default MilestonesList;
