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

  protected logOperation(operation: string, data?: any) {
    if (this.user) {
      logSecurityEvent(operation, { userId: this.user.id, ...data });
    }
  }

  protected async handleError(error: any, operation: string): Promise<never> {
    console.error(`Error in ${operation}:`, error);
    this.logOperation(`${operation}_error`, { error: error.message });
    throw error;
  }

  protected get supabase() {
    return supabase;
  }
}