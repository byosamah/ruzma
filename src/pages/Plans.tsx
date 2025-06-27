
import React from 'react';
import Layout from '@/components/Layout';
import { SubscriptionPlans } from '@/components/Subscription/SubscriptionPlans';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useDashboardActions } from '@/hooks/dashboard/useDashboardActions';
import { useT } from '@/lib/i18n';

const Plans = () => {
  const t = useT();
  const { user } = useAuth();
  const { handleSignOut } = useDashboardActions(() => Promise.resolve(true));

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">{t('loading')}</div>;
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-semibold text-gray-900">{t('choosePlan')}</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {t('upgradeAccount')}
          </p>
        </div>

        <SubscriptionPlans />
      </div>
    </Layout>
  );
};

export default Plans;
