
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';

const ProjectDetailsForm = () => {
  const t = useT();
  const { control } = useFormContext();

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('projectDetails')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('projectNameLabel')}</FormLabel>
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
              <FormLabel>{t('projectBriefLabel')}</FormLabel>
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
      </CardContent>
    </Card>
  );
};

export default ProjectDetailsForm;
