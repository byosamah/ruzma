
import { toast } from 'sonner';
import { validateEmail, sanitizeInput } from '@/lib/inputValidation';
import { rateLimitService } from '@/services/core/RateLimitService';
import { CreateClientData, UpdateClientData } from '@/types/client';

export const validateClientData = (clientData: CreateClientData | UpdateClientData, userId: string) => {
  if ('email' in clientData && clientData.email) {
    const emailValidation = validateEmail(clientData.email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error || 'Invalid email');
      return { isValid: false };
    }
  }

  if ('name' in clientData && clientData.name) {
    const sanitizedName = sanitizeInput(clientData.name);
    if (sanitizedName !== clientData.name) {
      return { isValid: true, sanitizedData: { ...clientData, name: sanitizedName } };
    }
  }

  return { isValid: true, sanitizedData: clientData };
};

export const checkRateLimit = (userId: string): boolean => {
  const result = rateLimitService.checkMultipleRateLimits(
    userId,
    ['client_creation_burst', 'client_creation']
  );
  return result.allowed;
};
