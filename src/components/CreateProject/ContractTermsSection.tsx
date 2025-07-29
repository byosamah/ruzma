import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CreateProjectFormData } from '@/lib/validators/project';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { FileText, DollarSign, Target, RotateCcw } from 'lucide-react';

interface ContractTermsSectionProps {
  form: UseFormReturn<CreateProjectFormData>;
}

export const ContractTermsSection: React.FC<ContractTermsSectionProps> = ({ form }) => {
  const [useTemplates, setUseTemplates] = useState(false);
  const [useDefaults, setUseDefaults] = useState({
    contractTerms: false,
    paymentTerms: false,
    projectScope: false,
    revisionPolicy: false,
  });
  const defaultContractTerms = `Terms and Conditions:

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

  const defaultPaymentTerms = `Payment Schedule:
- Payments due within 7 days of milestone completion
- Late payments may incur a 1.5% monthly fee
- All payments in the agreed project currency
- Payment methods: Bank transfer, PayPal, or as agreed
- Partial refunds available for incomplete milestones only`;

  const defaultProjectScope = `Project Deliverables:
[Outline specific deliverables, features, and requirements]

Timeline:
[Specify project duration and key deadlines]

Included Services:
[List what is included in the project price]

Not Included:
[Specify what is not included to avoid scope creep]`;

  const defaultRevisionPolicy = `Revision Policy:
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
      revisionPolicy: enabled,
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
    setUseDefaults(prev => ({ ...prev, [field]: newState }));
    
    if (newState) {
      form.setValue(field, defaultText);
    } else {
      form.setValue(field, '');
    }
    
    // Update master toggle based on individual states
    const updatedDefaults = { ...useDefaults, [field]: newState };
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
          <div className="flex items-center justify-between mb-2">
            <FormLabel>{label}</FormLabel>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {useDefaults[fieldName] ? 'Template' : 'Custom'}
              </span>
              <Switch
                checked={useDefaults[fieldName]}
                onCheckedChange={(checked) => handleToggleDefault(fieldName, defaultText)}
              />
            </div>
          </div>
          <FormControl>
            <Textarea
              placeholder={useDefaults[fieldName] ? "Using template text..." : placeholder}
              className="min-h-[200px] resize-y"
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Contract Terms
        </CardTitle>
        <CardDescription>
          Define the contract terms and conditions for this project. These will be sent to your client for approval.
        </CardDescription>
        <div className="flex items-center justify-between mt-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-medium">Use Contract Templates</h4>
            <p className="text-sm text-muted-foreground">Fill all sections with standard template text</p>
          </div>
          <Switch
            checked={useTemplates}
            onCheckedChange={handleMasterToggle}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="contract" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contract" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Contract
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="scope" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Scope
            </TabsTrigger>
            <TabsTrigger value="revisions" className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              Revisions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contract" className="space-y-4 mt-4">
            {renderContractField(
              'contractTerms',
              'General Contract Terms',
              'Enter contract terms and conditions...',
              defaultContractTerms
            )}
          </TabsContent>

          <TabsContent value="payment" className="space-y-4 mt-4">
            {renderContractField(
              'paymentTerms',
              'Payment Terms and Schedule',
              'Enter payment terms...',
              defaultPaymentTerms
            )}
          </TabsContent>

          <TabsContent value="scope" className="space-y-4 mt-4">
            {renderContractField(
              'projectScope',
              'Project Scope and Deliverables',
              'Define project scope...',
              defaultProjectScope
            )}
          </TabsContent>

          <TabsContent value="revisions" className="space-y-4 mt-4">
            {renderContractField(
              'revisionPolicy',
              'Revision Policy',
              'Enter revision policy...',
              defaultRevisionPolicy
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};