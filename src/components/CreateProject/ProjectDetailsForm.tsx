
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';
import { CreateProjectFormData } from '@/lib/validators/project';
import ClientDropdown from './ClientDropdown';
import MagicAIButton from './MagicAIButton';

interface ProjectDetailsFormProps {
  onAIGenerate?: () => void;
  isAIGenerating?: boolean;
}

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  onAIGenerate,
  isAIGenerating = false
}) => {
  const t = useT();
  const { control, watch } = useFormContext<CreateProjectFormData>();
  
  const briefValue = watch('brief');

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">{t('projectDetails')}</h3>
      </div>
      
      <div className="p-6 space-y-5">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {t('projectName')} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('projectNamePlaceholder')} 
                  className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm"
                  {...field} 
                />
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
              <FormLabel className="text-sm font-medium text-gray-700 flex items-center justify-between">
                <span>
                  {t('projectBrief')} <span className="text-red-500">*</span>
                </span>
                {onAIGenerate && (
                  <MagicAIButton
                    brief={field.value || ''}
                    onGenerate={onAIGenerate}
                    isGenerating={isAIGenerating}
                  />
                )}
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('projectBriefPlaceholder')} 
                  rows={3} 
                  className="border-gray-200 focus:border-gray-400 focus:ring-0 text-sm resize-none"
                  {...field} 
                />
              </FormControl>
              {briefValue && briefValue.length >= 20 && onAIGenerate && (
                <p className="text-xs text-purple-600 mt-1">
                  {t('aiGenerationHint')}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="clientEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">{t('client')}</FormLabel>
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
      </div>
    </div>
  );
};

export default ProjectDetailsForm;
