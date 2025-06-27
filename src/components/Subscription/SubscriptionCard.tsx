
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { SubscriptionPlan } from '@/hooks/subscription/useSubscription';
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
      return 'relative border-2 border-gray-900 bg-gray-50/30';
    }
    if (isPopular) {
      return 'relative border-2 border-gray-900 bg-white shadow-sm';
    }
    return 'relative border border-gray-200 bg-white hover:border-gray-300 transition-colors';
  };

  const getBadge = () => {
    if (isCurrentPlan) {
      return (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white hover:bg-gray-800 px-3 py-1">
          {t('currentPlan')}
        </Badge>
      );
    }
    if (isPopular) {
      return (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white hover:bg-gray-800 px-3 py-1">
          {t('recommended')}
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
    if (isPopular || isUpgrade()) {
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
      
      if (feature.includes('storage') || feature.includes('GB')) {
        const match = feature.match(/(\d+)GB/);
        if (match) {
          return `${match[1]}GB ${t('storage')}`;
        }
      }
      
      if (feature.includes('Basic support')) {
        return t('basicSupport');
      }
      if (feature.includes('Priority support')) {
        return t('prioritySupport');
      }
      
      if (feature.includes('Standard analytics')) {
        return t('standardAnalytics');
      }
      if (feature.includes('Advanced analytics')) {
        return t('advancedAnalytics');
      }
      
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
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg font-medium text-gray-900">{getPlanName(plan.id)}</CardTitle>
        <div className="mt-3">
          <span className="text-2xl font-semibold text-gray-900">{formatCurrency(plan.price, currency, language)}</span>
          <span className="text-sm text-gray-500 ml-1">/{plan.interval === 'month' ? t('month') : t('year')}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-6">
        {translateFeatures(plan.features).map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter className="pt-0">
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
