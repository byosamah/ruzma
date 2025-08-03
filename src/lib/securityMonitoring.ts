
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './authSecurity';

// Enhanced security event types
export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'data_access'
  | 'data_modification'
  | 'file_upload'
  | 'file_download'
  | 'permission_violation'
  | 'input_validation_failure'
  | 'rate_limit_exceeded'
  | 'suspicious_activity';

// Security monitoring class
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private eventQueue: Array<{
    event: SecurityEventType;
    details: Record<string, any>;
    timestamp: Date;
  }> = [];

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Log security events with enhanced context
  logEvent(event: SecurityEventType, details: Record<string, any> = {}) {
    const timestamp = new Date();
    const enhancedDetails = {
      ...details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: timestamp.toISOString(),
      sessionId: this.getSessionId()
    };

    // Add to queue for batch processing
    this.eventQueue.push({
      event,
      details: enhancedDetails,
      timestamp
    });

    // Log to console for immediate visibility
    console.log(`SECURITY_EVENT: ${event}`, enhancedDetails);

    // Process queue if it gets too large
    if (this.eventQueue.length >= 10) {
      this.processEventQueue();
    }

    // Also use the existing logSecurityEvent for consistency
    logSecurityEvent(event, enhancedDetails);
  }

  // Process and potentially send events to server
  private async processEventQueue() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // In a production environment, you might want to send these to a logging service
    try {
      // For now, we'll just log them locally
      // In the future, you could implement server-side logging here
      console.log('Processing security events batch:', events);
    } catch (error) {
      console.error('Failed to process security events:', error);
      // Re-add events to queue if processing failed
      this.eventQueue.unshift(...events);
    }
  }

  // Get or create session ID for tracking
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('security_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('security_session_id', sessionId);
    }
    return sessionId;
  }

  // Monitor data access patterns
  monitorDataAccess(resource: string, action: string, details: Record<string, any> = {}) {
    this.logEvent('data_access', {
      resource,
      action,
      ...details
    });
  }

  // Monitor data modifications
  monitorDataModification(resource: string, action: string, details: Record<string, any> = {}) {
    this.logEvent('data_modification', {
      resource,
      action,
      ...details
    });
  }

  // Monitor file operations
  monitorFileOperation(operation: 'upload' | 'download', filename: string, details: Record<string, any> = {}) {
    this.logEvent(operation === 'upload' ? 'file_upload' : 'file_download', {
      operation,
      filename,
      ...details
    });
  }

  // Monitor permission violations
  monitorPermissionViolation(resource: string, attemptedAction: string, details: Record<string, any> = {}) {
    this.logEvent('permission_violation', {
      resource,
      attemptedAction,
      severity: 'high',
      ...details
    });
  }

  // Monitor input validation failures
  monitorValidationFailure(input: string, validationType: string, details: Record<string, any> = {}) {
    this.logEvent('input_validation_failure', {
      input: input.substring(0, 100), // Limit logged input length
      validationType,
      ...details
    });
  }

  // Monitor suspicious activities
  monitorSuspiciousActivity(activity: string, details: Record<string, any> = {}) {
    this.logEvent('suspicious_activity', {
      activity,
      severity: 'critical',
      ...details
    });
  }

  // Rate limiting monitor
  private rateLimitTracker = new Map<string, Array<number>>();

  checkRateLimit(identifier: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.rateLimitTracker.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      this.logEvent('rate_limit_exceeded', {
        identifier: identifier.substring(0, 10) + '...',
        attempts: validAttempts.length,
        maxAttempts,
        windowMs
      });
      return false; // Rate limit exceeded, return false (not allowed)
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.rateLimitTracker.set(identifier, validAttempts);
    
    return true; // Rate limit not exceeded, return true (allowed)
  }

  // Clean up old rate limit data periodically
  cleanupRateLimitData() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [identifier, attempts] of this.rateLimitTracker.entries()) {
      const validAttempts = attempts.filter(time => now - time < oneHour);
      if (validAttempts.length === 0) {
        this.rateLimitTracker.delete(identifier);
      } else {
        this.rateLimitTracker.set(identifier, validAttempts);
      }
    }
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();

// Auto-cleanup rate limit data every 30 minutes
setInterval(() => {
  securityMonitor.cleanupRateLimitData();
}, 30 * 60 * 1000);
