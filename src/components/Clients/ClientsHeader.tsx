
import React from 'react';
import YouTubePopup from '@/components/YouTubePopup';
import { useT } from '@/lib/i18n';

const ClientsHeader: React.FC = () => {
  const t = useT();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-medium text-primary">{t('clients')}</h1>
        <YouTubePopup 
          videoId="bO9SF7XHl70"
          buttonText={t('knowMore')}
          buttonVariant="ghost"
          buttonSize="sm"
        />
      </div>
      <p className="text-sm text-secondary">{t('manageClientRelationships')}</p>
    </div>
  );
};

export default ClientsHeader;
