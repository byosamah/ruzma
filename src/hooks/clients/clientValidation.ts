
import { toast } from 'sonner';
import { validateEmail, sanitizeInput } from '@/lib/validation';
import { securityMonitor } from '@/lib/security';
import { CreateClientData, UpdateClientData } from '@/types/client';

export const validateClientData = (clientData: CreateClientData | UpdateClientData, userId: string) => {
  if ('email' in clientData && clientData.email) {
    const emailValidation = validateEmail(clientData.email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error || 'Invalid email');
      securityMonitor.monitorValidationFailure(clientData.email, 'email_validation');
      return { isValid: false };
    }
  }

  if ('name' in clientData && clientData.name) {
    const sanitizedName = sanitizeInput(clientData.name);
    if (sanitizedName !== clientData.name) {
      securityMonitor.monitorValidationFailure(clientData.name, 'name_sanitization');
      return { isValid: true, sanitizedData: { ...clientData, name: sanitizedName } };
    }
  }

  return { isValid: true, sanitizedData: clientData };
};

export const checkRateLimit = (userId: string): boolean => {
  const rateLimitKey = `create_client_${userId}`;
  if (!securityMonitor.checkRateLimit(rateLimitKey, 10, 60000)) { // 10 attempts per minute
    toast.error('Too many attempts. Please try again later.');
    return false;
  }
  return true;
};
