import { z } from 'zod';
import { useValidationMessages } from './i18n';

export const createClientSchema = () => {
  const messages = useValidationMessages();
  
  return z.object({
    name: z.string()
      .min(1, messages.clientNameRequired)
      .max(100, messages.clientNameMaxLength)
      .trim(),
    email: z.string()
      .min(1, messages.required)
      .email(messages.invalidEmail)
      .max(255, messages.emailMaxLength)
      .trim()
      .toLowerCase(),
    notes: z.string()
      .max(500, messages.notesMaxLength)
      .optional(),
  });
};

// Static schemas for form usage
export const clientSchema = z.object({
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

// Backward compatibility exports
export const createClientSchemaStatic = clientSchema;
export const editClientSchemaStatic = clientSchema;

export const editClientSchema = createClientSchema;

export type CreateClientFormData = z.infer<typeof createClientSchema>;
export type EditClientFormData = z.infer<typeof editClientSchema>;