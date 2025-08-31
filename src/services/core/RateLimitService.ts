import { toast } from 'sonner';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  action: string;
}

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts?: number;
  resetTime?: number;
  message?: string;
}

export class RateLimitService {
  private static instance: RateLimitService;
  private rateLimitTracker = new Map<string, Array<number>>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  // Rate limit configurations for different actions
  private configs: Record<string, RateLimitConfig> = {
    project_creation: {
      maxAttempts: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      action: 'project creation'
    },
    project_creation_burst: {
      maxAttempts: 3,
      windowMs: 5 * 60 * 1000, // 5 minutes - burst protection
      action: 'project creation (burst)'
    },
    client_creation: {
      maxAttempts: 15,
      windowMs: 60 * 60 * 1000, // 1 hour
      action: 'client creation'
    },
    client_creation_burst: {
      maxAttempts: 5,
      windowMs: 5 * 60 * 1000, // 5 minutes
      action: 'client creation (burst)'
    }
  };

  static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
      // Start cleanup interval every 10 minutes
      RateLimitService.instance.startCleanupInterval();
    }
    return RateLimitService.instance;
  }

  private startCleanupInterval(): void {
    // Clean up old data every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldData();
    }, 10 * 60 * 1000);
  }

  /**
   * Check if an action is rate limited for a user
   * @param userId - The user ID
   * @param action - The action being performed (e.g., 'project_creation', 'client_creation')
   * @param showToast - Whether to show error toast on rate limit
   * @returns RateLimitResult with allowed status and additional info
   */
  checkRateLimit(userId: string, action: string, showToast: boolean = true): RateLimitResult {
    const config = this.configs[action];
    if (!config) {
      return { allowed: true };
    }

    const identifier = `${action}_${userId}`;
    const now = Date.now();
    const attempts = this.rateLimitTracker.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < config.windowMs);
    
    if (validAttempts.length >= config.maxAttempts) {
      const oldestAttempt = Math.min(...validAttempts);
      const resetTime = oldestAttempt + config.windowMs;
      const minutesUntilReset = Math.ceil((resetTime - now) / (60 * 1000));
      
      const message = `Too many ${config.action} attempts. Please try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`;
      
      if (showToast) {
        toast.error(message);
      }
      
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime,
        message
      };
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.rateLimitTracker.set(identifier, validAttempts);
    
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - validAttempts.length,
      resetTime: now + config.windowMs
    };
  }

  /**
   * Check multiple rate limits (e.g., both burst and hourly limits)
   * @param userId - The user ID
   * @param actions - Array of actions to check
   * @param showToast - Whether to show error toast on rate limit
   * @returns RateLimitResult - fails if any check fails
   */
  checkMultipleRateLimits(userId: string, actions: string[], showToast: boolean = true): RateLimitResult {
    for (const action of actions) {
      const result = this.checkRateLimit(userId, action, showToast);
      if (!result.allowed) {
        return result;
      }
    }
    return { allowed: true };
  }

  /**
   * Get remaining attempts for a specific action
   */
  getRemainingAttempts(userId: string, action: string): number {
    const result = this.checkRateLimit(userId, action, false);
    return result.remainingAttempts || 0;
  }

  /**
   * Reset rate limit for a specific user and action (admin/testing use)
   */
  resetRateLimit(userId: string, action: string): void {
    const identifier = `${action}_${userId}`;
    this.rateLimitTracker.delete(identifier);
  }

  /**
   * Clean up old rate limit data to prevent memory leaks
   */
  cleanupOldData(): void {
    const now = Date.now();
    const maxWindow = Math.max(...Object.values(this.configs).map(c => c.windowMs));
    
    for (const [identifier, attempts] of this.rateLimitTracker.entries()) {
      const validAttempts = attempts.filter(time => now - time < maxWindow);
      if (!validAttempts.length) {
        this.rateLimitTracker.delete(identifier);
      } else {
        this.rateLimitTracker.set(identifier, validAttempts);
      }
    }
  }

  /**
   * Get rate limit status for display purposes
   */
  getRateLimitStatus(userId: string, action: string): {
    isNearLimit: boolean;
    remainingAttempts: number;
    resetTime: number;
  } {
    const config = this.configs[action];
    if (!config) {
      return { isNearLimit: false, remainingAttempts: 999, resetTime: 0 };
    }

    const identifier = `${action}_${userId}`;
    const now = Date.now();
    const attempts = this.rateLimitTracker.get(identifier) || [];
    const validAttempts = attempts.filter(time => now - time < config.windowMs);
    
    const remainingAttempts = config.maxAttempts - validAttempts.length;
    const isNearLimit = remainingAttempts <= 2;
    const resetTime = validAttempts.length > 0 ? 
      Math.min(...validAttempts) + config.windowMs : 
      now + config.windowMs;

    return {
      isNearLimit,
      remainingAttempts,
      resetTime
    };
  }
}

// Export singleton instance
export const rateLimitService = RateLimitService.getInstance();