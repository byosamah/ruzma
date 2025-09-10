import React from 'react';
import { AlertTriangle, Clock, Archive } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGracePeriodWarnings, useGracePeriodMessage } from '@/hooks/subscription/useGracePeriodWarnings';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { useT } from '@/lib/i18n';
import { formatCurrency } from '@/lib/currency';

interface GracePeriodWarningProps {
  variant?: 'banner' | 'card';
  className?: string;
}

export function GracePeriodWarning({ variant = 'banner', className }: GracePeriodWarningProps) {
  const { data: warning, isLoading } = useGracePeriodWarnings();
  const message = useGracePeriodMessage();
  const { navigate } = useLanguageNavigation();
  const t = useT();

  if (isLoading || !warning?.isInGracePeriod || !message) {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/plans');
  };

  const handleUpdatePayment = () => {
    navigate('/profile#billing');
  };

  const getBorderColor = () => {
    if (message.type === 'critical') return 'border-red-500';
    return 'border-orange-500';
  };

  const getTextColor = () => {
    if (message.type === 'critical') return 'text-red-700';
    return 'text-orange-700';
  };

  const getBgColor = () => {
    if (message.type === 'critical') return 'bg-red-50';
    return 'bg-orange-50';
  };

  if (variant === 'card') {
    return (
      <Card className={`${getBorderColor()} ${getBgColor()} ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {message.type === 'critical' ? (
                <AlertTriangle className={`h-6 w-6 ${getTextColor()}`} />
              ) : (
                <Clock className={`h-6 w-6 ${getTextColor()}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${getTextColor()}`}>
                {warning.gracePeriodType === 'trial' ? 'Trial Grace Period' : 'Payment Grace Period'}
              </div>
              <div className="mt-1 text-sm text-gray-700">
                {message.message}
              </div>
              
              {warning.projectsAtRisk > 0 && (
                <div className="mt-3 p-3 bg-white/50 rounded-md">
                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-800">
                    <Archive className="h-4 w-4" />
                    <span>Projects at Risk of Archival:</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {warning.projectsAtRiskList.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between text-sm text-gray-600">
                        <span>{project.name}</span>
                        {project.total_amount && (
                          <span className="text-gray-500">
                            {formatCurrency(project.total_amount, project.currency || 'USD')}
                          </span>
                        )}
                      </div>
                    ))}
                    {warning.projectsAtRiskList.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{warning.projectsAtRiskList.length - 3} more projects
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex space-x-3">
                {warning.gracePeriodType === 'trial' ? (
                  <Button onClick={handleUpgrade} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Upgrade Now
                  </Button>
                ) : (
                  <Button onClick={handleUpdatePayment} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Update Payment Method
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/projects')}
                  className="border-gray-300"
                >
                  View Projects
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Banner variant
  return (
    <Alert className={`${getBorderColor()} ${getBgColor()} ${className}`}>
      <div className="flex items-center space-x-2">
        {message.type === 'critical' ? (
          <AlertTriangle className={`h-5 w-5 ${getTextColor()}`} />
        ) : (
          <Clock className={`h-5 w-5 ${getTextColor()}`} />
        )}
        <AlertDescription className={`flex-1 ${getTextColor()}`}>
          <strong>
            {warning.gracePeriodType === 'trial' ? 'Trial Grace Period:' : 'Payment Grace Period:'}
          </strong>{' '}
          {message.message}
        </AlertDescription>
        <div className="flex space-x-2">
          {warning.gracePeriodType === 'trial' ? (
            <Button onClick={handleUpgrade} size="sm" variant="outline">
              Upgrade
            </Button>
          ) : (
            <Button onClick={handleUpdatePayment} size="sm" variant="outline">
              Update Payment
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

/**
 * Compact warning for use in navigation or headers
 */
export function GracePeriodBadge() {
  const { data: warning } = useGracePeriodWarnings();
  const message = useGracePeriodMessage();
  const { navigate } = useLanguageNavigation();

  if (!warning?.isInGracePeriod || !message) {
    return null;
  }

  const handleClick = () => {
    if (warning.gracePeriodType === 'trial') {
      navigate('/plans');
    } else {
      navigate('/profile#billing');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium
        ${message.type === 'critical' 
          ? 'bg-red-100 text-red-800 hover:bg-red-200' 
          : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
        }
        transition-colors duration-200
      `}
    >
      <Clock className="h-3 w-3" />
      <span>{message.daysRemaining} days left</span>
      {warning.projectsAtRisk > 0 && (
        <>
          <span>•</span>
          <Archive className="h-3 w-3" />
          <span>{warning.projectsAtRisk} at risk</span>
        </>
      )}
    </button>
  );
}