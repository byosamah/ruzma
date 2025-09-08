
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';
import { CreateProjectFormData } from '@/lib/validators/project';
import ClientDropdown from './ClientDropdown';
import { EnhancedCurrencySelect } from '@/components/ui/enhanced-currency-select';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useEffect } from 'react';

import { User } from '@supabase/supabase-js';

const ProjectDetailsForm = ({ user }: { user?: User | null }) => {
  const t = useT();
  const { control, setValue, watch } = useFormContext<CreateProjectFormData>();
  const { user: authUser } = useAuth();
  const { data: profile } = useProfileQuery(authUser);
  const { currency: userCurrency } = useUserCurrency(profile);
  
  const currentCurrency = watch('currency');

  // Set default currency to user's preferred currency when component mounts
  useEffect(() => {
    if (userCurrency && !currentCurrency) {
      setValue('currency', userCurrency);
    }
  }, [userCurrency, currentCurrency, setValue]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">{t('projectDetails')}</h3>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
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
                  className="border-gray-300 border h-10 sm:h-9 text-base sm:text-sm"
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
              <FormLabel className="text-sm font-medium text-gray-700">
                {t('projectBrief')} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('projectBriefPlaceholder')} 
                  rows={3} 
                  className="border-gray-300 border text-base sm:text-sm resize-none"
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
              <FormLabel className="text-sm font-medium text-gray-700">{t('client')}</FormLabel>
              <FormControl>
                <ClientDropdown
                  value={field.value}
                  onChange={field.onChange}
                  user={user}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                {t('projectCurrency')}
              </FormLabel>
              <FormControl>
                <EnhancedCurrencySelect
                  value={field.value || userCurrency || 'USD'}
                  onChange={field.onChange}
                  placeholder={t('selectCurrency')}
                  showCountryFlags={true}
                  showSearch={true}
                  className="border-gray-300"
                />
              </FormControl>
              <p className="text-xs text-gray-500 mt-1">
                {userCurrency && field.value === userCurrency 
                  ? t('usingProfileCurrency') 
                  : t('projectCurrencyHelp')
                }
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ProjectDetailsForm;
