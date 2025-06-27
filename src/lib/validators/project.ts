
import { z } from 'zod';

export const createProjectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  brief: z.string().min(1, 'Project brief is required'),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientId: z.string().optional(), // Add clientId field
  paymentProofRequired: z.boolean().default(false),
  milestones: z.array(z.object({
    title: z.string().min(1, 'Milestone title is required'),
    description: z.string().min(1, 'Milestone description is required'),
    price: z.number().min(0, 'Price must be positive'),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  })).min(1, 'At least one milestone is required'),
});

export type CreateProjectFormData = z.infer<typeof createProjectFormSchema>;
