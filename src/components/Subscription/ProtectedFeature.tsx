import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatureAccess } from '@/hooks/subscription/useSubscription';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { FeatureAccess } from '@/lib/subscriptionValidator';
import { Crown, Zap } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface ProtectedFeatureProps {
  children: ReactNode;
  feature: keyof FeatureAccess;
  fallback?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function ProtectedFeature({ 
  children, 
  feature, 
  fallback, 
  title, 
  description, 
  className 
}: ProtectedFeatureProps) {
  const { canAccess, userType, isLoading, validation } = useFeatureAccess(feature);
  const { navigate } = useLanguageNavigation();
  const t = useT();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (canAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  const getUpgradeContent = () => {
    switch (feature) {
      case 'customBranding':
        return {
          title: title || 'Custom Branding',
          description: description || 'Personalize your client portal with custom colors, logos, and branding.',
          icon: <Crown className="h-8 w-8 text-yellow-500" />,
          requiredPlan: userType === 'free' ? 'Plus' : 'Pro'
        };
      case 'advancedAnalytics':
        return {
          title: title || 'Advanced Analytics',
          description: description || 'Get detailed insights into your projects, earnings, and client behavior.',
          icon: <Zap className="h-8 w-8 text-blue-500" />,
          requiredPlan: userType === 'free' ? 'Plus' : 'Pro'
        };
      case 'prioritySupport':
        return {
          title: title || 'Priority Support',
          description: description || 'Get priority email support and faster response times.',
          icon: <Crown className="h-8 w-8 text-purple-500" />,
          requiredPlan: 'Pro'
        };
      case 'unlimitedProjects':
        return {
          title: title || 'Unlimited Projects',
          description: description || 'Create unlimited projects and manage multiple clients.',
          icon: <Zap className="h-8 w-8 text-green-500" />,
          requiredPlan: userType === 'free' ? 'Plus' : 'Pro'
        };
      default:
        return {
          title: title || 'Premium Feature',
          description: description || 'This feature requires a premium subscription.',
          icon: <Crown className="h-8 w-8 text-yellow-500" />,
          requiredPlan: 'Plus'
        };
    }
  };

  const content = getUpgradeContent();
  
  // Get status message
  const getStatusMessage = () => {
    if (validation?.isTrialExpired) {
      return 'Your trial has expired.';
    }
    if (validation?.isGracePeriod) {
      return 'Please update your payment method.';
    }
    return `Upgrade to ${content.requiredPlan} to unlock this feature.`;
  };

  return (
    <Card className={`text-center ${className || ''}`}>
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4">
          {content.icon}
        </div>
        <CardTitle className="text-xl">{content.title}</CardTitle>
        <CardDescription className="text-base">
          {content.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {getStatusMessage()}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={() => navigate('/plans')}
              className="flex items-center gap-2"
            >
              <Crown className="h-4 w-4" />
              {validation?.isTrialExpired || validation?.isGracePeriod 
                ? 'Renew Subscription' 
                : `Upgrade to ${content.requiredPlan}`
              }
            </Button>
            {userType !== 'free' && (
              <Button 
                variant="outline" 
                onClick={() => window.open('https://docs.ruzma.co/features', '_blank')}
              >
                Learn More
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Hook version for conditional rendering without a wrapper component
 */
export function useProtectedFeature(feature: keyof FeatureAccess) {
  const { canAccess, userType, isLoading, validation } = useFeatureAccess(feature);
  
  return {
    canAccess,
    userType,
    isLoading,
    validation,
    isBlocked: !canAccess,
    needsUpgrade: userType === 'free',
    isTrialExpired: validation?.isTrialExpired || false,
    inGracePeriod: validation?.isGracePeriod || false,
  };
}