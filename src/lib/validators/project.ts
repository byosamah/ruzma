
import { z } from 'zod';
import { CURRENCIES } from '@/lib/currency';
import { useValidationMessages } from './i18n';

// Get all currency codes for validation
const currencyCodes = Object.keys(CURRENCIES) as [string, ...string[]];

export const createProjectFormSchema = () => {
  const messages = useValidationMessages();
  
  return z.object({
    name: z.string().min(1, messages.projectNameRequired),
    brief: z.string().min(10, messages.projectBriefMinLength),
    clientEmail: z.string().email(messages.invalidEmail).optional().or(z.literal('')),
    currency: z.enum(currencyCodes).default('USD'),
    paymentProofRequired: z.boolean().default(false),
    contractRequired: z.boolean().default(false),
    contractTerms: z.string().optional(),
    paymentTerms: z.string().optional(),
    projectScope: z.string().optional(),
    revisionPolicy: z.string().optional(),
    milestones: z.array(z.object({
      title: z.string().min(1, messages.milestoneTitleRequired),
      description: z.string().min(1, messages.milestoneDescriptionRequired),
      price: z.coerce.number().min(0, messages.priceMinimum),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    })).min(1, messages.milestoneRequired),
  });
};

// Backward compatibility export
export const createProjectFormSchemaStatic = z.object({
  name: z.string().min(1, 'Project name is required'),
  brief: z.string().min(10, 'Project brief must be at least 10 characters'),
  clientEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  currency: z.enum(currencyCodes).default('USD'),
  paymentProofRequired: z.boolean().default(false),
  contractRequired: z.boolean().default(false),
  contractTerms: z.string().optional(),
  paymentTerms: z.string().optional(),
  projectScope: z.string().optional(),
  revisionPolicy: z.string().optional(),
  milestones: z.array(z.object({
    title: z.string().min(1, 'Milestone title is required'),
    description: z.string().min(1, 'Milestone description is required'),
    price: z.coerce.number().min(0, 'Price must be 0 or greater'),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  })).min(1, 'At least one milestone is required'),
});

export type CreateProjectFormData = z.infer<typeof createProjectFormSchema>;
