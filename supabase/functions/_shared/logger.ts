export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId: string;
  message: string;
  data?: unknown;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LogContext {
  requestId: string;
  functionName: string;
  startTime: number;
}

export class Logger {
  private context: LogContext;

  constructor(functionName: string, requestId?: string) {
    this.context = {
      requestId: requestId || this.generateRequestId(),
      functionName,
      startTime: Date.now(),
    };
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(level: LogLevel, message: string, data?: unknown, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      requestId: this.context.requestId,
      message: `[${this.context.functionName}] ${message}`,
    };

    if (data !== undefined) {
      entry.data = this.sanitizeData(data);
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private sanitizeData(data: unknown): unknown {
    if (typeof data === 'string') {
      // Remove potential sensitive information
      return data.replace(/\b\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\b/g, '[UUID]')
                .replace(/\bemail=[\w.-]+@[\w.-]+/g, 'email=[REDACTED]')
                .replace(/\bpassword=\S+/g, 'password=[REDACTED]')
                .replace(/\btoken=\S+/g, 'token=[REDACTED]');
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data as Record<string, unknown> };
      
      // Remove sensitive keys
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
      for (const key of sensitiveKeys) {
        if (key in sanitized) {
          sanitized[key] = '[REDACTED]';
        }
      }

      return sanitized;
    }

    return data;
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    const entry = this.createLogEntry(level, message, data, error);
    
    // Format for console output
    const formattedMessage = `[${entry.timestamp}] ${entry.level.toUpperCase()} ${entry.message}`;
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, entry.data);
        break;
      case 'info':
        console.info(formattedMessage, entry.data);
        break;
      case 'warn':
        console.warn(formattedMessage, entry.data);
        break;
      case 'error':
        console.error(formattedMessage, entry.error || entry.data);
        break;
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error, data?: unknown): void {
    this.log('error', message, data, error);
  }

  startOperation(operationName: string): OperationLogger {
    return new OperationLogger(this, operationName);
  }

  getDuration(): number {
    return Date.now() - this.context.startTime;
  }

  getRequestId(): string {
    return this.context.requestId;
  }
}

export class OperationLogger {
  private logger: Logger;
  private operationName: string;
  private startTime: number;

  constructor(logger: Logger, operationName: string) {
    this.logger = logger;
    this.operationName = operationName;
    this.startTime = Date.now();
    
    this.logger.debug(`Starting operation: ${operationName}`);
  }

  success(message?: string, data?: unknown): void {
    const duration = Date.now() - this.startTime;
    const successMessage = message || `Operation completed: ${this.operationName}`;
    
    this.logger.info(successMessage, {
      operation: this.operationName,
      duration,
      ...data,
    });
  }

  failure(error: Error, message?: string, data?: unknown): void {
    const duration = Date.now() - this.startTime;
    const failureMessage = message || `Operation failed: ${this.operationName}`;
    
    this.logger.error(failureMessage, error, {
      operation: this.operationName,
      duration,
      ...data,
    });
  }

  step(stepName: string, data?: unknown): void {
    this.logger.debug(`${this.operationName} - ${stepName}`, data);
  }
}

// Helper function to create a logger instance
export function createLogger(functionName: string, requestId?: string): Logger {
  return new Logger(functionName, requestId);
}

// Helper function to extract request ID from headers
export function getRequestIdFromHeaders(headers: Headers): string | undefined {
  return headers.get('x-request-id') || headers.get('cf-ray') || undefined;
}