import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CriticalErrorTitle,
  ComponentErrorTitle,
  ApplicationErrorAlertTitle,
  ComponentErrorAlertTitle,
  CriticalErrorDescription,
  ComponentErrorDescription,
  TryAgainText,
  RefreshPageText,
  GoHomeText,
  ErrorDetailsText,
  RetryAttemptText,
  ErrorIdText,
  ErrorText,
  StackTraceText,
  ComponentStackText
} from './ErrorBoundaryText';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  showDetails?: boolean;
  maxRetries?: number;
  level?: 'page' | 'component' | 'critical';
}

interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  level: string;
  userId?: string;
  sessionId?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, level = 'component' } = this.props;
    const errorId = this.state.errorId;

    this.setState({
      error,
      errorInfo,
    });

    // Create error report
    const errorReport: ErrorReport = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      level,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Report:', errorReport);
      console.groupEnd();
    }

    // Report to monitoring service
    this.reportError(errorReport);

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, errorId);
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private getUserId(): string | undefined {
    // Try to get user ID from various sources
    try {
      // Check localStorage for user session
      const userSession = localStorage.getItem('supabase.auth.token');
      if (userSession) {
        const parsed = JSON.parse(userSession);
        return parsed?.user?.id;
      }
      
      // Check for user in global state or context
      return undefined;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string | undefined {
    try {
      // Try to get or create a session ID
      let sessionId = sessionStorage.getItem('error-boundary-session-id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('error-boundary-session-id', sessionId);
      }
      return sessionId;
    } catch {
      return undefined;
    }
  }

  private async reportError(errorReport: ErrorReport): Promise<void> {
    try {
      // In production, send to monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to Sentry, LogRocket, or custom endpoint
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport),
        }).catch(() => {
          // Silently fail if error reporting fails
          // Note: This is a hardcoded console message for development only
          console.warn('Failed to report error to monitoring service');
        });
      }

      // Store locally for debugging
      this.storeErrorLocally(errorReport);
    } catch {
      // Silently handle error reporting failures
    }
  }

  private storeErrorLocally(errorReport: ErrorReport): void {
    try {
      const errors = JSON.parse(localStorage.getItem('error-boundary-logs') || '[]');
      errors.push(errorReport);
      
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      
      localStorage.setItem('error-boundary-logs', JSON.stringify(errors));
    } catch {
      // Silently handle localStorage failures
    }
  }

  private handleRetry = (): void => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: prevState.retryCount + 1,
    }));

    // Add a small delay before retrying to prevent immediate re-error
    this.retryTimeoutId = setTimeout(() => {
      this.forceUpdate();
    }, 100);
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  private renderErrorDetails(): ReactNode {
    const { showDetails = process.env.NODE_ENV === 'development' } = this.props;
    const { error, errorInfo, errorId } = this.state;

    if (!showDetails || !error) {
      return null;
    }

    return (
      <details className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Bug className="inline w-4 h-4 mr-2" />
          <ErrorDetailsText errorId={errorId} />
        </summary>
        <div className="space-y-3 text-xs font-mono">
          <div>
            <strong className="text-red-600 dark:text-red-400"><ErrorText /></strong>
            <pre className="mt-1 p-2 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 rounded overflow-x-auto">
              {error.message}
            </pre>
          </div>
          {error.stack && (
            <div>
              <strong className="text-orange-600 dark:text-orange-400"><StackTraceText /></strong>
              <pre className="mt-1 p-2 bg-orange-50 dark:bg-orange-950 text-orange-800 dark:text-orange-200 rounded overflow-x-auto max-h-32">
                {error.stack}
              </pre>
            </div>
          )}
          {errorInfo?.componentStack && (
            <div>
              <strong className="text-blue-600 dark:text-blue-400"><ComponentStackText /></strong>
              <pre className="mt-1 p-2 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 rounded overflow-x-auto max-h-32">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      </details>
    );
  }

  private renderFallbackUI(): ReactNode {
    const { fallbackComponent, level = 'component', maxRetries = 3 } = this.props;
    const { retryCount, errorId } = this.state;

    if (fallbackComponent) {
      return fallbackComponent;
    }

    const canRetry = retryCount < maxRetries;
    const isCritical = level === 'critical';

    return (
      <Card className="w-full max-w-2xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {isCritical ? <CriticalErrorTitle /> : <ComponentErrorTitle />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {isCritical ? <ApplicationErrorAlertTitle /> : <ComponentErrorAlertTitle />}
            </AlertTitle>
            <AlertDescription>
              {isCritical ? <CriticalErrorDescription /> : <ComponentErrorDescription />}
            </AlertDescription>
          </Alert>

          {retryCount > 0 && (
            <Alert>
              <AlertDescription>
                <RetryAttemptText retryCount={retryCount} maxRetries={maxRetries} />
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            {canRetry && (
              <Button
                onClick={this.handleRetry}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <TryAgainText />
              </Button>
            )}
            
            <Button
              onClick={this.handleReload}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <RefreshPageText />
            </Button>

            <Button
              onClick={this.handleGoHome}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <GoHomeText />
            </Button>
          </div>

          {this.renderErrorDetails()}

          <div className="text-xs text-muted-foreground">
            <ErrorIdText errorId={errorId} />
          </div>
        </CardContent>
      </Card>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderFallbackUI();
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different use cases

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="page"
      maxRetries={2}
      showDetails={false}
      onError={(error, errorInfo, errorId) => {
        console.error('Page Error:', { error, errorInfo, errorId });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: ReactNode; 
  componentName?: string; 
}) {
  return (
    <ErrorBoundary
      level="component"
      maxRetries={3}
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo, errorId) => {
        console.error(`Component Error (${componentName}):`, { 
          error, 
          errorInfo, 
          errorId 
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function CriticalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="critical"
      maxRetries={1}
      showDetails={true}
      onError={(error, errorInfo, errorId) => {
        console.error('Critical Error:', { error, errorInfo, errorId });
        
        // Could send to monitoring service immediately for critical errors
        // Analytics.track('critical_error', { errorId, message: error.message });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for programmatic error boundary usage
export function useErrorHandler() {
  const handleError = (error: Error) => {
    // This will be caught by the nearest error boundary
    throw error;
  };

  return { handleError };
}