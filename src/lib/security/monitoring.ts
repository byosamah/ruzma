// Security event types for monitoring
export type SecurityEventType = 
  | 'login_attempt' 
  | 'login_success' 
  | 'login_failure'
  | 'logout' 
  | 'signup_attempt' 
  | 'signup_success' 
  | 'signup_failure'
  | 'password_reset' 
  | 'account_deletion'
  | 'data_access' 
  | 'data_modification' 
  | 'permission_violation'
  | 'file_upload' 
  | 'file_download'
  | 'input_sanitization' 
  | 'validation_failure'
  | 'suspicious_activity' 
  | 'rate_limit_exceeded'
  | 'client_project_access'
  | 'filename_sanitization';

// Enhanced security monitoring class
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private rateLimitData: Map<string, { count: number; lastReset: number }> = new Map();

  private constructor() {}

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  // Enhanced logging with more context
  logEvent(event: SecurityEventType, details: Record<string, any> = {}) {
    const logData = {
      event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.generateSessionId(),
      ...details
    };

    // Log to console for debugging
    console.log(`[SECURITY] ${event}:`, logData);

    // In a production environment, you would send this to your logging service
    // Example: send to analytics, log aggregation service, etc.
  }

  // Monitor data access events
  monitorDataAccess(resource: string, action: string, details: Record<string, any> = {}) {
    this.logEvent('data_access', {
      resource,
      action,
      ...details
    });
  }

  // Monitor data modification events
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
      filename: this.sanitizeFilename(filename),
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

  // Monitor validation failures
  monitorValidationFailure(input: string, validationType: string, details: Record<string, any> = {}) {
    this.logEvent('validation_failure', {
      validationType,
      inputPreview: this.sanitizeInput(input).substring(0, 100),
      ...details
    });
  }

  // Monitor suspicious activities
  monitorSuspiciousActivity(activity: string, details: Record<string, any> = {}) {
    this.logEvent('suspicious_activity', {
      activity,
      severity: 'critical',
      requiresInvestigation: true,
      ...details
    });
  }

  // Rate limiting functionality
  checkRateLimit(identifier: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const data = this.rateLimitData.get(identifier);

    if (!data || now - data.lastReset > windowMs) {
      this.rateLimitData.set(identifier, { count: 1, lastReset: now });
      return false; // Not rate limited - first attempt in window
    }

    if (data.count >= maxAttempts) {
      this.logEvent('rate_limit_exceeded', {
        identifier: this.sanitizeInput(identifier),
        attempts: data.count,
        windowMs,
        maxAttempts
      });
      return true; // Rate limited - exceeded max attempts
    }

    data.count++;
    return false; // Not rate limited - under max attempts
  }

  // Cleanup old rate limit data
  cleanupRateLimitData() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, data] of this.rateLimitData.entries()) {
      if (now - data.lastReset > maxAge) {
        this.rateLimitData.delete(key);
      }
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private sanitizeInput(input: string): string {
    return input.replace(/[<>'"&]/g, '').substring(0, 100);
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();

// Set up periodic cleanup
setInterval(() => {
  securityMonitor.cleanupRateLimitData();
}, 60 * 60 * 1000); // Every hour