
import { z } from 'zod';

export const createProjectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  brief: z.string().min(10, 'Project brief must be at least 10 characters'),
  clientEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
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
