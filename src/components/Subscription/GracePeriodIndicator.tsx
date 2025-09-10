import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CreditCard } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { SubscriptionValidationResult } from '@/lib/subscriptionValidator';

interface GracePeriodIndicatorProps {
  validation: SubscriptionValidationResult;
  onUpdatePayment?: () => void;
  className?: string;
}

export function GracePeriodIndicator({ 
  validation, 
  onUpdatePayment, 
  className 
}: GracePeriodIndicatorProps) {
  const t = useT();

  // Don't show if user is not in a grace period
  if (!validation.isGracePeriod || !validation.gracePeriodType || !validation.daysUntilExpiry) {
    return null;
  }

  const { gracePeriodType, daysUntilExpiry } = validation;
  const isTrialGrace = gracePeriodType === 'trial';
  const isPaymentGrace = gracePeriodType === 'payment';
  const isExpiringSoon = daysUntilExpiry <= 2;

  // Determine alert styling based on grace period type and urgency
  const alertVariant = isExpiringSoon ? 'destructive' : 'default';
  const badgeVariant = isTrialGrace ? 'secondary' : 'destructive';
  const IconComponent = isTrialGrace ? Clock : CreditCard;

  const title = isTrialGrace 
    ? t('trialGracePeriod') 
    : t('paymentGracePeriod');

  const message = isTrialGrace
    ? t('trialGraceMessage', { days: daysUntilExpiry.toString() })
    : t('paymentGraceMessage', { days: daysUntilExpiry.toString() });

  const daysText = daysUntilExpiry === 1 
    ? t('dayRemaining', { days: daysUntilExpiry.toString() })
    : t('daysRemaining', { days: daysUntilExpiry.toString() });

  return (
    <Alert 
      variant={alertVariant}
      className={cn(
        "border-l-4 transition-all duration-200",
        isTrialGrace && "border-l-amber-500 bg-amber-50/50 border-amber-200",
        isPaymentGrace && "border-l-destructive bg-destructive/5",
        isExpiringSoon && "animate-pulse",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent 
            className={cn(
              "h-4 w-4",
              isTrialGrace && "text-amber-600",
              isPaymentGrace && "text-destructive"
            )} 
          />
        </div>
        
        <div className="flex-grow space-y-2">
          <div className="flex items-center justify-between">
            <AlertTitle className="mb-0 text-sm font-medium">
              {title}
            </AlertTitle>
            <Badge 
              variant={badgeVariant}
              className="flex items-center gap-1 text-xs"
            >
              {isExpiringSoon && <AlertTriangle className="h-3 w-3" />}
              {daysText}
            </Badge>
          </div>
          
          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>
          
          {isPaymentGrace && onUpdatePayment && (
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onUpdatePayment}
                className="text-xs"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                {t('updatePaymentMethod')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}