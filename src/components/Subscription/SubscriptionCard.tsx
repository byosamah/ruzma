
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown } from 'lucide-react';
import { SubscriptionPlan } from '@/hooks/useSubscription';
import { CurrencyCode, formatCurrency } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { useT } from '@/lib/i18n';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  currency: CurrencyCode;
  isPopular?: boolean;
  popularText?: string;
  isCurrentPlan?: boolean;
  currentUserType?: string;
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  currency,
  isPopular = false,
  popularText = 'Most Popular',
  isCurrentPlan = false,
  currentUserType = 'free',
  onSelectPlan,
  isLoading = false
}) => {
  const { language } = useLanguage();
  const t = useT();
  
  const getCardClassName = () => {
    if (isCurrentPlan) {
      return 'relative border-green-500 bg-green-50/50';
    }
    if (isPopular) {
      return 'relative border-primary shadow-lg scale-105';
    }
    return 'relative';
  };

  const getBadge = () => {
    if (isCurrentPlan) {
      return (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600">
          {t('currentPlan')}
        </Badge>
      );
    }
    if (isPopular) {
      const badgeText = plan.id === 'plus' ? t('recommended') : t('comingSoon');
      return (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
          {badgeText}
        </Badge>
      );
    }
    return null;
  };

  const getPlanTierValue = (planId: string): number => {
    switch (planId) {
      case 'free':
        return 0;
      case 'plus':
        return 1;
      case 'pro':
        return 2;
      default:
        return 0;
    }
  };

  const isDowngrade = () => {
    const currentTier = getPlanTierValue(currentUserType);
    const targetTier = getPlanTierValue(plan.id);
    return currentTier > targetTier;
  };

  const isUpgrade = () => {
    const currentTier = getPlanTierValue(currentUserType);
    const targetTier = getPlanTierValue(plan.id);
    return currentTier < targetTier;
  };

  const getButtonText = () => {
    if (isCurrentPlan) {
      return t('currentPlan');
    }
    if (isLoading) {
      return t('processing');
    }
    if (isDowngrade()) {
      return t('downgrade');
    }
    if (isUpgrade()) {
      return t('upgrade');
    }
    return t('choosePlanButton');
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) {
      return 'secondary' as const;
    }
    if (isDowngrade()) {
      return 'outline' as const;
    }
    if (isPopular) {
      return 'default' as const;
    }
    return 'outline' as const;
  };

  const isButtonDisabled = () => {
    return isLoading || isCurrentPlan || plan.id === 'pro';
  };

  // Translate plan names
  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'free':
        return t('free');
      case 'plus':
        return t('plus');
      case 'pro':
        return t('pro');
      default:
        return plan.name;
    }
  };

  // Translate plan features
  const translateFeatures = (features: string[]) => {
    return features.map(feature => {
      // Handle project count features
      if (feature.includes('project') && !feature.includes('projects')) {
        return `1 ${t('project')}`;
      }
      if (feature.includes('projects')) {
        const match = feature.match(/(\d+)\s+projects/);
        if (match) {
          return `${match[1]} ${t('projects')}`;
        }
        if (feature.includes('Unlimited')) {
          return t('unlimitedProjects');
        }
      }
      
      // Handle storage features
      if (feature.includes('storage') || feature.includes('GB')) {
        const match = feature.match(/(\d+)GB/);
        if (match) {
          return `${match[1]}GB ${t('storage')}`;
        }
      }
      
      // Handle support features
      if (feature.includes('Basic support')) {
        return t('basicSupport');
      }
      if (feature.includes('Priority support')) {
        return t('prioritySupport');
      }
      
      // Handle analytics features
      if (feature.includes('Standard analytics')) {
        return t('standardAnalytics');
      }
      if (feature.includes('Advanced analytics')) {
        return t('advancedAnalytics');
      }
      
      // Handle sharing features
      if (feature.includes('Links-sharing only')) {
        return t('linksSharing');
      }
      if (feature.includes('File uploads')) {
        return t('fileUploads');
      }
      if (feature.includes('Custom branding')) {
        return t('customBranding');
      }
      
      return feature;
    });
  };

  return (
    <Card className={getCardClassName()}>
      {getBadge()}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{getPlanName(plan.id)}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{formatCurrency(plan.price, currency, language)}</span>
          <span className="text-muted-foreground">/{plan.interval === 'month' ? t('month') : t('year')}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {translateFeatures(plan.features).map((feature, index) => (
          <div key={index} className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onSelectPlan(plan.id)}
          disabled={isButtonDisabled()}
          className="w-full"
          variant={getButtonVariant()}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};
