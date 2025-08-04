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
// Icons replaced with emojis

interface ContractTermsSectionProps {
  form: UseFormReturn<CreateProjectFormData>;
}

export const ContractTermsSection: React.FC<ContractTermsSectionProps> = ({
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

  const defaultContractTerms = language === 'ar' ? 
    `الشروط والأحكام:

1. نطاق العمل
يوافق المستقل على تقديم الخدمات المحددة في نطاق المشروع والمراحل المفصلة في هذه الاتفاقية.

2. شروط الدفع
سيتم الدفع وفقاً لجدول المراحل المحدد أدناه. جميع المدفوعات مستحقة خلال 7 أيام من اكتمال المرحلة والموافقة عليها.

3. الملكية الفكرية
عند الدفع الكامل، ستنتقل جميع حقوق الملكية الفكرية للعمل المكتمل إلى العميل.

4. السرية
يوافق الطرفان على الحفاظ على سرية جميع المعلومات الخاصة المشتركة أثناء هذا المشروع.

5. المراجعات
المراجعات مشمولة كما هو محدد في سياسة المراجعات. المراجعات الإضافية خارج النطاق قد تستدعي رسوماً إضافية.

6. الإنهاء
يمكن لأي من الطرفين إنهاء هذه الاتفاقية بإشعار كتابي مدته 7 أيام. سيدفع العميل مقابل جميع الأعمال المكتملة حتى تاريخ الإنهاء.` : 
    `Terms and Conditions:

1. SCOPE OF WORK
The freelancer agrees to provide the services outlined in the project scope and milestones detailed in this agreement.

2. PAYMENT TERMS
Payment will be made according to the milestone schedule outlined below. All payments are due within 7 days of milestone completion and approval.

3. INTELLECTUAL PROPERTY
Upon full payment, all intellectual property rights for the completed work will transfer to the client.

4. CONFIDENTIALITY
Both parties agree to maintain confidentiality of all proprietary information shared during this project.

5. REVISIONS
Revisions are included as outlined in the revision policy. Additional revisions beyond the scope may incur extra charges.

6. TERMINATION
Either party may terminate this agreement with 7 days written notice. Client will pay for all completed work up to the termination date.`;

  const defaultPaymentTerms = language === 'ar' ? 
    `جدول الدفع:
- المدفوعات مستحقة خلال 7 أيام من اكتمال المرحلة
- المدفوعات المتأخرة قد تستدعي رسوماً شهرية بنسبة 1.5%
- جميع المدفوعات بعملة المشروع المتفق عليها
- طرق الدفع: التحويل البنكي، باي بال، أو كما متفق عليه
- المبالغ المستردة الجزئية متاحة للمراحل غير المكتملة فقط` : 
    `Payment Schedule:
- Payments due within 7 days of milestone completion
- Late payments may incur a 1.5% monthly fee
- All payments in the agreed project currency
- Payment methods: Bank transfer, PayPal, or as agreed
- Partial refunds available for incomplete milestones only`;

  const defaultProjectScope = language === 'ar' ? 
    `مخرجات المشروع:
[حدد المخرجات المحددة والميزات والمتطلبات]

الجدول الزمني:
[حدد مدة المشروع والمواعيد الرئيسية]

الخدمات المشمولة:
[اذكر ما هو مشمول في سعر المشروع]

غير مشمول:
[حدد ما هو غير مشمول لتجنب توسع النطاق]` : 
    `Project Deliverables:
[Outline specific deliverables, features, and requirements]

Timeline:
[Specify project duration and key deadlines]

Included Services:
[List what is included in the project price]

Not Included:
[Specify what is not included to avoid scope creep]`;

  const defaultRevisionPolicy = language === 'ar' ? 
    `سياسة المراجعات:
- حتى جولتين من المراجعات مشمولة لكل مرحلة
- يجب طلب المراجعات خلال 7 أيام من التسليم
- المراجعات الإضافية: 50 دولار في الساعة
- التغييرات الرئيسية في النطاق تتطلب اتفاقية منفصلة
- يجب أن تكون المراجعات محددة وقابلة للتنفيذ` : 
    `Revision Policy:
- Up to 2 rounds of revisions included per milestone
- Revisions must be requested within 7 days of delivery
- Additional revisions: $50 per hour
- Major scope changes require separate agreement
- Revisions must be specific and actionable`;

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
          <div className={`flex items-center justify-between mb-2 ${language === 'ar' ? 'rtl:flex-row-reverse' : ''}`}>
            <FormLabel className="text-sm font-medium text-gray-700">{label}</FormLabel>
            <div className={`flex items-center gap-2 ${language === 'ar' ? 'rtl:flex-row-reverse' : ''}`}>
              <span className="text-sm text-gray-500">
                {t('useTemplate')}
              </span>
              <Switch
                checked={useDefaults[fieldName]}
                onCheckedChange={(checked) => handleToggleDefault(fieldName, defaultText)}
              />
            </div>
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <div className={`flex items-center gap-2 mb-2 ${language === 'ar' ? 'rtl:flex-row-reverse' : ''}`}>
          <span className="text-base sm:text-xl text-gray-600">📄</span>
          <h3 className="text-sm font-medium text-gray-900">{t('contractTermsTitle')}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-3 sm:mb-4">
          {t('contractTermsDescription')}
        </p>

        {/* Contract Required Toggle */}
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg mb-3 sm:mb-4 space-y-2 sm:space-y-0 ${language === 'ar' ? 'rtl:flex-row-reverse' : ''}`}>
          <div>
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
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0 ${language === 'ar' ? 'rtl:flex-row-reverse' : ''}`}>
            <div>
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
            <TabsList className={`grid w-full grid-cols-2 sm:grid-cols-4 h-auto ${language === 'ar' ? 'rtl:flex-row-reverse' : ''}`}>
              <TabsTrigger value="contract" className={`flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 ${language === 'ar' ? 'rtl:flex-row-reverse' : ''}`}>
                <span className="text-sm sm:text-lg">📄</span>
                <span className="hidden sm:inline">{t('contractTab')}</span>
                <span className="sm:hidden">{t('contractTabShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className={`flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 ${language === 'ar' ? 'rtl:flex-row-reverse' : ''}`}>
                <span className="text-sm sm:text-lg">💰</span>
                <span className="hidden sm:inline">{t('paymentTab')}</span>
                <span className="sm:hidden">{t('paymentTabShort')}</span>
              </TabsTrigger>
              <TabsTrigger value="scope" className={`flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 ${language === 'ar' ? 'rtl:flex-row-reverse' : ''}`}>
                <span className="text-sm sm:text-lg">🎯</span>
                <span className="hidden sm:inline">{t('scopeTab')}</span>
                <span className="sm:hidden">{t('scopeTab')}</span>
              </TabsTrigger>
              <TabsTrigger value="revisions" className={`flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-2 ${language === 'ar' ? 'rtl:flex-row-reverse' : ''}`}>
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