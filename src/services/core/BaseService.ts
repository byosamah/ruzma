import { AppError } from '@/types/common';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/lib/authSecurity';

export abstract class BaseService {
  protected user: User | null;

  constructor(user: User | null) {
    this.user = user;
  }

  protected ensureAuthenticated(): User {
    if (!this.user) {
      throw new Error('User not authenticated');
    }
    return this.user;
  }

  protected logOperation(operation: string, data?: Record<string, unknown>) {
    if (this.user) {
      logSecurityEvent(operation, { userId: this.user.id, ...data });
    }
  }

  protected async handleError(error: unknown, operation: string): Promise<never> {
    const appError = error as AppError;
    // Error details logged for debugging purposes
    this.logOperation(`${operation}_error`, { error: appError.message });
    throw error;
  }

  protected get supabase() {
    return supabase;
  }
}