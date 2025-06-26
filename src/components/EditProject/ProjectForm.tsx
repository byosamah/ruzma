
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { MilestoneFormData } from './types';
import { MilestoneItemEditor } from './MilestoneItemEditor';
import { useT } from '@/lib/i18n';
import ClientDropdown from '@/components/CreateProject/ClientDropdown';
import PaymentProofSettings from '@/components/CreateProject/PaymentProofSettings';
import { FormProvider, useForm } from 'react-hook-form';

interface ProjectFormProps {
  name: string;
  brief: string;
  clientEmail: string;
  paymentProofRequired: boolean;
  milestones: MilestoneFormData[];
  updating: boolean;
  onNameChange: (name: string) => void;
  onBriefChange: (brief: string) => void;
  onClientEmailChange: (email: string) => void;
  onPaymentProofRequiredChange: (required: boolean) => void;
  onMilestoneChange: (index: number, field: keyof MilestoneFormData, value: string | number) => void;
  onAddMilestone: () => void;
  onDeleteMilestone: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  name,
  brief,
  clientEmail,
  paymentProofRequired,
  milestones,
  updating,
  onNameChange,
  onBriefChange,
  onClientEmailChange,
  onPaymentProofRequiredChange,
  onMilestoneChange,
  onAddMilestone,
  onDeleteMilestone,
  onSubmit,
}) => {
  const t = useT();
  
  // Create a form context for the PaymentProofSettings component
  const form = useForm({
    defaultValues: {
      paymentProofRequired: paymentProofRequired
    },
    values: {
      paymentProofRequired: paymentProofRequired
    }
  });

  // Update the form when paymentProofRequired changes
  React.useEffect(() => {
    form.setValue('paymentProofRequired', paymentProofRequired);
  }, [paymentProofRequired, form]);

  // Handle form changes
  const handlePaymentProofChange = (value: boolean) => {
    form.setValue('paymentProofRequired', value);
    onPaymentProofRequiredChange(value);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">{t('projectName')}</label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t('projectNamePlaceholder_edit')}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="brief" className="text-sm font-medium text-slate-700">{t('projectBrief')}</label>
          <Textarea
            id="brief"
            value={brief}
            onChange={(e) => onBriefChange(e.target.value)}
            placeholder={t('projectBriefPlaceholder_edit')}
            required
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="clientEmail" className="text-sm font-medium text-slate-700">Client</label>
          <ClientDropdown
            value={clientEmail}
            onChange={onClientEmailChange}
          />
        </div>

        {/* Payment & Delivery Settings */}
        <div className="pt-6 border-t">
          <PaymentProofSettings />
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-medium text-slate-800">{t('milestones')}</h3>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <MilestoneItemEditor
                key={index}
                milestone={milestone}
                index={index}
                onMilestoneChange={onMilestoneChange}
                onDeleteMilestone={onDeleteMilestone}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onAddMilestone}
            className="w-full flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addMilestone')}
          </Button>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={updating}>
            {updating ? t('saving') : t('saveChanges')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
