import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CreateProjectFormData } from '@/lib/validators/project';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { DEFAULT_CONTRACT_TERMS, DEFAULT_PAYMENT_TERMS, DEFAULT_PROJECT_SCOPE, DEFAULT_REVISION_POLICY } from '@/lib/constants/contractTemplates';
// Icons replaced with emojis

interface ContractTermsSectionProps {
  form: UseFormReturn<CreateProjectFormData>;
}

export const ContractTermsSection = ({
  form
}) => {
  const t = useT();
  const { language } = useLanguage();
  const contractRequired = form.watch("contractRequired");
  const [useTemplates, setUseTemplates] = useState(false);
  const [useDefaults, setUseDefaults] = useState({
    contractTerms: false,
    paymentTerms: false,
    projectScope: false,
    revisionPolicy: false
  });

  const defaultContractTerms = DEFAULT_CONTRACT_TERMS[language];

  const defaultPaymentTerms = DEFAULT_PAYMENT_TERMS[language];

  const defaultProjectScope = DEFAULT_PROJECT_SCOPE[language];

  const defaultRevisionPolicy = DEFAULT_REVISION_POLICY[language];

  const handleMasterToggle = (enabled: boolean) => {
    setUseTemplates(enabled);
    setUseDefaults({
      contractTerms: enabled,
      paymentTerms: enabled,
      projectScope: enabled,
      revisionPolicy: enabled
    });

    if (enabled) {
      form.setValue('contractTerms', defaultContractTerms);
      form.setValue('paymentTerms', defaultPaymentTerms);
      form.setValue('projectScope', defaultProjectScope);
      form.setValue('revisionPolicy', defaultRevisionPolicy);
    } else {
      form.setValue('contractTerms', '');
      form.setValue('paymentTerms', '');
      form.setValue('projectScope', '');
      form.setValue('revisionPolicy', '');
    }
  };

  const handleToggleDefault = (field: keyof typeof useDefaults, defaultText: string) => {
    const newState = !useDefaults[field];
    setUseDefaults(prev => ({
      ...prev,
      [field]: newState
    }));

    if (newState) {
      form.setValue(field, defaultText);
    } else {
      form.setValue(field, '');
    }

    // Update master toggle based on individual states
    const updatedDefaults = {
      ...useDefaults,
      [field]: newState
    };
    const allEnabled = Object.values(updatedDefaults).every(Boolean);
    const allDisabled = Object.values(updatedDefaults).every(v => !v);
    
    if (allEnabled || allDisabled) {
      setUseTemplates(allEnabled);
    }
  };

  const renderContractField = (
    fieldName: keyof typeof useDefaults,
    label: string,
    placeholder: string,
    defaultText: string
  ) => (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <div className={`flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg mb-3 sm:mb-4 space-y-2 sm:space-y-0 gap-4 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
            <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <FormLabel className="text-sm font-medium text-gray-900">{label}</FormLabel>
              <p className="text-sm text-gray-500">{t('useTemplate')}</p>
            </div>
            <Switch
              checked={useDefaults[fieldName]}
              onCheckedChange={(checked) => handleToggleDefault(fieldName, defaultText)}
            />
          </div>
          <FormControl>
            <Textarea
              placeholder={useDefaults[fieldName] ? t('usingTemplateText') : placeholder}
              className={`min-h-[200px] resize-y border-gray-200 focus:border-gray-400 focus:ring-0 text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              {...field}
              disabled={useDefaults[fieldName]}
              value={useDefaults[fieldName] ? defaultText : field.value}
              onChange={(e) => {
                if (!useDefaults[fieldName]) {
                  field.onChange(e.target.value);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <div className={`flex items-center gap-2 mb-2 ${language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
          <span className="text-base sm:text-xl text-gray-600">📄</span>
          <h3 className={`text-sm font-medium text-gray-900 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('contractTermsTitle')}</h3>
        </div>
        <p className={`text-sm text-gray-500 mb-3 sm:mb-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          {t('contractTermsDescription')}
        </p>

        {/* Contract Required Toggle */}
        <div className={`flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg mb-3 sm:mb-4 space-y-2 sm:space-y-0 gap-4 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
          <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h4 className="text-sm font-medium text-gray-900">{t('requireContractApproval')}</h4>
            <p className="text-sm text-gray-500">{t('requireContractDescription')}</p>
          </div>
          <FormField
            control={form.control}
            name="contractRequired"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {!contractRequired && (
          <Alert className="mb-3 sm:mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <span className="text-base sm:text-lg">⚠️</span>
            <AlertDescription>
              {t('contractApprovalDisabled')}
            </AlertDescription>
          </Alert>
        )}

        {contractRequired && (
          <div className={`flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0 gap-4 ${language === 'ar' ? 'sm:flex-row-reverse' : ''}`}>
            <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <h4 className="text-sm font-medium text-gray-900">{t('useTemplateForAll')}</h4>
              <p className="text-sm text-gray-500">{t('useTemplateDescription')}</p>
            </div>
            <Switch checked={useTemplates} onCheckedChange={handleMasterToggle} />
          </div>
        )}
      </div>

      {contractRequired && (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <Tabs defaultValue="contract" className="w-full">
            <TabsList className={`grid w-full grid-cols-2 sm:grid-cols-4 h-auto ${language === 'ar' ? 'grid-flow-row-dense' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <TabsTrigger value="contract" className={`flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm sm:text-lg">📄</span>
                <span className="hidden sm:inline">{t('contractTab')}</span>
                <span className="sm:hidden">{t('contractTabShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className={`flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm sm:text-lg">💰</span>
                <span className="hidden sm:inline">{t('paymentTab')}</span>
                <span className="sm:hidden">{t('paymentTabShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="scope" className={`flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm sm:text-lg">🎯</span>
                <span className="hidden sm:inline">{t('scopeTab')}</span>
                <span className="sm:hidden">{t('scopeTab')}</span>
              </TabsTrigger>
              <TabsTrigger value="revisions" className={`flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm sm:text-lg">🔄</span>
                <span className="hidden sm:inline">{t('revisionsTab')}</span>
                <span className="sm:hidden">{t('revisionsTabShort')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contract" className="space-y-4 mt-4">
              {renderContractField('contractTerms', t('generalContractTerms'), t('contractTermsPlaceholder'), defaultContractTerms)}
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-4">
              {renderContractField('paymentTerms', t('paymentTermsAndSchedule'), t('paymentTermsPlaceholder'), defaultPaymentTerms)}
            </TabsContent>

            <TabsContent value="scope" className="space-y-4 mt-4">
              {renderContractField('projectScope', t('projectScopeAndDeliverables'), t('projectScopePlaceholder'), defaultProjectScope)}
            </TabsContent>

            <TabsContent value="revisions" className="space-y-4 mt-4">
              {renderContractField('revisionPolicy', t('revisionPolicyTitle'), t('revisionPolicyPlaceholder'), defaultRevisionPolicy)}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};