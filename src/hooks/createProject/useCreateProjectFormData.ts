
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectFormSchema, CreateProjectFormData } from '@/lib/validators/project';

// Default contract text constants
const getDefaultContractTerms = () => `Terms and Conditions:

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

const getDefaultPaymentTerms = () => `Payment Schedule:
- Payments due within 7 days of milestone completion
- Late payments may incur a 1.5% monthly fee
- All payments in the agreed project currency
- Payment methods: Bank transfer, PayPal, or as agreed
- Partial refunds available for incomplete milestones only`;

const getDefaultProjectScope = () => `Project Deliverables:
[Outline specific deliverables, features, and requirements]

Timeline:
[Specify project duration and key deadlines]

Included Services:
[List what is included in the project price]

Not Included:
[Specify what is not included to avoid scope creep]`;

const getDefaultRevisionPolicy = () => `Revision Policy:
- Up to 2 rounds of revisions included per milestone
- Revisions must be requested within 7 days of delivery
- Additional revisions: $50 per hour
- Major scope changes require separate agreement
- Revisions must be specific and actionable`;

export const useCreateProjectFormData = (templateData?: any) => {
  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: templateData?.name || '',
      brief: templateData?.brief || '',
      clientEmail: templateData?.clientEmail || '',
      paymentProofRequired: templateData?.paymentProofRequired || false,
      contractTerms: templateData?.contractTerms || getDefaultContractTerms(),
      paymentTerms: templateData?.paymentTerms || getDefaultPaymentTerms(),
      projectScope: templateData?.projectScope || getDefaultProjectScope(),
      revisionPolicy: templateData?.revisionPolicy || getDefaultRevisionPolicy(),
      milestones: templateData?.milestones?.map((milestone: any) => ({
        title: milestone.title || '',
        description: milestone.description || '',
        price: milestone.price || 0,
        start_date: milestone.start_date || '',
        end_date: milestone.end_date || '',
      })) || [{ title: '', description: '', price: 0, start_date: '', end_date: '' }],
    },
  });

  const addMilestone = useCallback(() => {
    const currentMilestones = form.getValues('milestones');
    form.setValue('milestones', [...currentMilestones, { title: '', description: '', price: 0, start_date: '', end_date: '' }]);
  }, [form]);

  const removeMilestone = useCallback((index: number) => {
    const currentMilestones = form.getValues('milestones');
    if (currentMilestones.length > 1) {
      form.setValue('milestones', currentMilestones.filter((_, i) => i !== index));
    }
  }, [form]);

  const loadFromTemplate = useCallback((template: any) => {
    console.log('Loading template:', template);
    
    const templateMilestones = template.milestones?.map((milestone: any) => ({
      title: milestone.title || '',
      description: milestone.description || '',
      price: milestone.price || 0,
      start_date: milestone.start_date || '',
      end_date: milestone.end_date || '',
    })) || [{ title: '', description: '', price: 0, start_date: '', end_date: '' }];

    form.setValue('name', template.name || '');
    form.setValue('brief', template.brief || '');
    form.setValue('clientEmail', template.clientEmail || '');
    form.setValue('milestones', templateMilestones);
  }, [form]);

  return {
    form,
    addMilestone,
    removeMilestone,
    loadFromTemplate,
  };
};
