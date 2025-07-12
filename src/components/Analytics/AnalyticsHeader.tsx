
import React from 'react';
import YouTubePopup from '@/components/YouTubePopup';
import { useT } from '@/lib/i18n';

const AnalyticsHeader: React.FC = () => {
  const t = useT();

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-medium text-gray-900">{t('analytics')}</h1>
        <YouTubePopup 
          videoId="a5pv1YmqaeE"
          buttonText={t('knowMore')}
          buttonVariant="ghost"
          buttonSize="sm"
        />
      </div>
      <p className="text-sm text-gray-500">{t('trackBusinessPerformance')}</p>
    </div>
  );
};

export default AnalyticsHeader;
