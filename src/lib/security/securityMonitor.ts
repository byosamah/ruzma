
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'data_access' | 'file_upload' | 'rate_limit' | 'validation' | 'suspicious';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  // Log security events with automatic severity assessment
  async logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
    };

    // Add to local storage
    this.events.push(securityEvent);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console for immediate visibility
    console.log(`SECURITY_EVENT [${event.severity.toUpperCase()}]:`, securityEvent);

    // Store critical and high severity events in database using notifications table
    if (event.severity === 'critical' || event.severity === 'high') {
      try {
        await this.storeInDatabase(securityEvent);
      } catch (error) {
        console.error('Failed to store security event in database:', error);
      }
    }

    // Trigger alerts for critical events
    if (event.severity === 'critical') {
      this.triggerAlert(securityEvent);
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      // In a real application, you might want to get this from your backend
      // For now, we'll use a placeholder
      return 'client-ip-not-available';
    } catch {
      return 'unknown';
    }
  }

  private async storeInDatabase(event: SecurityEvent) {
    try {
      // Store security events in the notifications table for now
      await supabase.from('notifications').insert({
        type: `security_${event.type}`,
        title: `Security Event: ${event.message}`,
        message: JSON.stringify({
          severity: event.severity,
          details: event.details,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          timestamp: event.timestamp.toISOString(),
        }),
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database security logging failed:', error);
    }
  }

  private triggerAlert(event: SecurityEvent) {
    // In production, this would send alerts to security team
    console.error('🚨 CRITICAL SECURITY ALERT:', {
      type: event.type,
      message: event.message,
      details: event.details,
      timestamp: event.timestamp,
    });

    // You could implement email notifications, Slack alerts, etc.
    // For now, we'll just ensure it's prominently logged
  }

  // Get recent security events for monitoring dashboard
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get events by type
  getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }

  // Get events by severity
  getEventsBySeverity(severity: SecurityEvent['severity']): SecurityEvent[] {
    return this.events.filter(event => event.severity === severity);
  }

  // Check for suspicious patterns
  detectSuspiciousActivity(): SecurityEvent[] {
    const suspiciousEvents: SecurityEvent[] = [];
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Look for rapid successive failures
    const recentFailures = this.events.filter(event => 
      event.timestamp > fiveMinutesAgo && 
      (event.type === 'authentication' || event.type === 'authorization') &&
      (event.severity === 'high' || event.severity === 'medium')
    );

    if (recentFailures.length > 10) {
      suspiciousEvents.push({
        type: 'suspicious',
        severity: 'critical',
        message: 'Multiple authentication/authorization failures detected',
        details: { failureCount: recentFailures.length },
        timestamp: now
      });
    }

    // Look for unusual file upload patterns
    const recentUploads = this.events.filter(event => 
      event.timestamp > fiveMinutesAgo && 
      event.type === 'file_upload'
    );

    if (recentUploads.length > 20) {
      suspiciousEvents.push({
        type: 'suspicious',
        severity: 'high',
        message: 'Unusual file upload activity detected',
        details: { uploadCount: recentUploads.length },
        timestamp: now
      });
    }

    return suspiciousEvents;
  }

  // Clear old events (privacy compliance)
  clearOldEvents(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    this.events = this.events.filter(event => event.timestamp > cutoffDate);
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor();

// Auto-detect suspicious activity every 5 minutes
setInterval(() => {
  const suspiciousEvents = securityMonitor.detectSuspiciousActivity();
  suspiciousEvents.forEach(event => {
    securityMonitor.logEvent(event);
  });
}, 5 * 60 * 1000);

// Clean up old events daily
setInterval(() => {
  securityMonitor.clearOldEvents();
}, 24 * 60 * 60 * 1000);

// Convenience functions for common security events
export const logAuthEvent = (success: boolean, details?: Record<string, any>) => {
  securityMonitor.logEvent({
    type: 'authentication',
    severity: success ? 'low' : 'medium',
    message: success ? 'Authentication successful' : 'Authentication failed',
    details
  });
};

export const logAuthorizationEvent = (success: boolean, resource: string, details?: Record<string, any>) => {
  securityMonitor.logEvent({
    type: 'authorization',
    severity: success ? 'low' : 'high',
    message: success ? `Access granted to ${resource}` : `Access denied to ${resource}`,
    details: { resource, ...details }
  });
};

export const logFileUploadEvent = (success: boolean, filename: string, details?: Record<string, any>) => {
  securityMonitor.logEvent({
    type: 'file_upload',
    severity: success ? 'low' : 'medium',
    message: success ? `File uploaded: ${filename}` : `File upload failed: ${filename}`,
    details: { filename, ...details }
  });
};

export const logValidationEvent = (field: string, value: string, details?: Record<string, any>) => {
  securityMonitor.logEvent({
    type: 'validation',
    severity: 'medium',
    message: `Validation failed for ${field}`,
    details: { field, value: value.substring(0, 50), ...details }
  });
};

export const logRateLimitEvent = (identifier: string, details?: Record<string, any>) => {
  securityMonitor.logEvent({
    type: 'rate_limit',
    severity: 'high',
    message: `Rate limit exceeded for ${identifier}`,
    details: { identifier, ...details }
  });
};
