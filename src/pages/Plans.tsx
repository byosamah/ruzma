
import React from 'react';
import Layout from '@/components/Layout';
import { SubscriptionPlans } from '@/components/Subscription/SubscriptionPlans';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useT } from '@/lib/i18n';

const Plans = () => {
  const t = useT();
  const { user, handleSignOut } = useAuth();

  if (!user) {
    return <div>{t('loading')}</div>;
  }

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-slate-600">
            Upgrade your account to unlock more features and storage
          </p>
        </div>

        <SubscriptionPlans />
      </div>
    </Layout>
  );
};

export default Plans;
