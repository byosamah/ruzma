
import React from 'react';
import { useT } from '@/lib/i18n';

const AnalyticsHeader: React.FC = () => {
  const t = useT();

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-medium text-gray-900">{t('analytics')}</h1>
      <p className="text-sm text-gray-500">Track your business performance and growth</p>
    </div>
  );
};

export default AnalyticsHeader;
