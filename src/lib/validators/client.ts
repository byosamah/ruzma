import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string()
    .min(1, 'Client name is required')
    .max(100, 'Client name must be less than 100 characters')
    .trim(),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase(),
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

export const editClientSchema = createClientSchema;

export type CreateClientFormData = z.infer<typeof createClientSchema>;
export type EditClientFormData = z.infer<typeof editClientSchema>;