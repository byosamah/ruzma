
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';
import { CreateProjectFormData } from '@/lib/validators/project';
import ClientDropdown from './ClientDropdown';

const ProjectDetailsForm = () => {
  const t = useT();
  const { control } = useFormContext<CreateProjectFormData>();

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('projectDetails')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('projectName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('projectNamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="brief"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('projectBrief')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('projectBriefPlaceholder')} 
                  rows={4} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="clientEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('client')}</FormLabel>
              <FormControl>
                <ClientDropdown
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default ProjectDetailsForm;
