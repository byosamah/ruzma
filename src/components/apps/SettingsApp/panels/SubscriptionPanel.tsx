/**
 * Subscription Panel Component
 *
 * Subscription and billing settings panel for the Settings app.
 * Shows current plan and upgrade options.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/core/useAuth';
import { useProfileQuery } from '@/hooks/core/useProfileQuery';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

// =============================================================================
// PLAN DATA
// =============================================================================

const plans = [
  {
    id: 'free',
    name: 'Free',
    nameAr: 'مجاني',
    price: '$0',
    priceAr: '0$',
    features: [
      { en: '1 Project', ar: 'مشروع واحد' },
      { en: '5 Clients', ar: '5 عملاء' },
      { en: '5 Invoices', ar: '5 فواتير' },
      { en: 'Basic Support', ar: 'دعم أساسي' },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    nameAr: 'بلس',
    price: '$19/mo',
    priceAr: '19$/شهر',
    features: [
      { en: 'Unlimited Projects', ar: 'مشاريع غير محدودة' },
      { en: 'Unlimited Clients', ar: 'عملاء غير محدودين' },
      { en: 'Unlimited Invoices', ar: 'فواتير غير محدودة' },
      { en: 'Custom Branding', ar: 'علامة تجارية مخصصة' },
      { en: 'Priority Support', ar: 'دعم ذو أولوية' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    nameAr: 'برو',
    price: '$349',
    priceAr: '349$',
    features: [
      { en: 'Everything in Plus', ar: 'كل مميزات بلس' },
      { en: 'Lifetime Access', ar: 'وصول مدى الحياة' },
      { en: 'One-time Payment', ar: 'دفعة واحدة' },
    ],
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SubscriptionPanel() {
  const { dir } = useLanguage();
  const t = useT();
  const isRTL = dir === 'rtl';

  // Auth & profile
  const { user } = useAuth();
  const { data: profile } = useProfileQuery(user);

  const currentPlan = profile?.user_type || 'free';

  return (
    <div className="p-6 space-y-6">
      {/* Current Plan */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-600">
          {t('currentPlan') || 'Current Plan'}
        </h3>
        <p className={cn(
          'text-3xl font-bold mt-2',
          currentPlan === 'pro' 
            ? 'text-purple-600'
            : currentPlan === 'plus'
            ? 'text-blue-600'
            : 'text-gray-600'
        )}>
          {currentPlan.toUpperCase()}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isUpgrade = !isCurrent && (
            (currentPlan === 'free' && (plan.id === 'plus' || plan.id === 'pro')) ||
            (currentPlan === 'plus' && plan.id === 'pro')
          );

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative overflow-hidden',
                isCurrent && 'ring-2 ring-blue-500'
              )}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl">
                  {t('current') || 'Current'}
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {isRTL ? plan.nameAr : plan.name}
                </CardTitle>
                <p className="text-2xl font-bold">
                  {isRTL ? plan.priceAr : plan.price}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={cn(
                        'flex items-center gap-2 text-sm',
                        isRTL && 'flex-row-reverse'
                      )}
                    >
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span>{isRTL ? feature.ar : feature.en}</span>
                    </li>
                  ))}
                </ul>

                {isUpgrade && (
                  <Button className="w-full" variant={plan.id === 'pro' ? 'default' : 'outline'}>
                    {t('upgrade') || 'Upgrade'}
                  </Button>
                )}
                {isCurrent && (
                  <Button className="w-full" variant="outline" disabled>
                    {t('currentPlan') || 'Current Plan'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subscription Status */}
      {profile?.subscription_status && (
        <Card>
          <CardContent className="p-4">
            <div className={cn(
              'flex items-center justify-between',
              isRTL && 'flex-row-reverse'
            )}>
              <span className="text-gray-600">
                {t('subscriptionStatus') || 'Subscription Status'}
              </span>
              <span className={cn(
                'px-2 py-1 rounded-full text-sm font-medium',
                profile.subscription_status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              )}>
                {profile.subscription_status.toUpperCase()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SubscriptionPanel;
