import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useTrialStatus, useSubscriptionStatus } from '@/hooks/subscription/useSubscription';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { AlertCircle, Clock, CreditCard } from 'lucide-react';

export function SubscriptionStatusBanner() {
  const { navigate } = useLanguageNavigation();
  const { isOnTrial, trialMessage, isTrialExpiring, isTrialExpired } = useTrialStatus();
  const { inGracePeriod, isExpired, subscription } = useSubscriptionStatus();

  // Don't show banner for free users or active premium users
  if (subscription?.user_type === 'free' || 
      (subscription?.subscription_status === 'active' && !isOnTrial)) {
    return null;
  }

  // Trial status banner
  if (isOnTrial && trialMessage) {
    return (
      <Alert className={`mb-4 ${isTrialExpiring ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'}`}>
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">
            {trialMessage}
          </span>
          <Button 
            size="sm" 
            onClick={() => navigate('/plans')}
            variant={isTrialExpiring ? 'default' : 'outline'}
          >
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Grace period (payment failed) banner
  if (inGracePeriod) {
    return (
      <Alert className="mb-4 border-red-500 bg-red-50">
        <CreditCard className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm text-red-700">
            Payment failed. Please update your payment method to avoid service interruption.
          </span>
          <Button 
            size="sm" 
            onClick={() => navigate('/plans')}
            variant="destructive"
          >
            Update Payment
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Expired subscription banner  
  if (isExpired || isTrialExpired) {
    return (
      <Alert className="mb-4 border-red-500 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm text-red-700">
            Your subscription has expired. Upgrade to continue using premium features.
          </span>
          <Button 
            size="sm" 
            onClick={() => navigate('/plans')}
            variant="destructive"
          >
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}