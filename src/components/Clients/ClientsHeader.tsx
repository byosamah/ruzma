
import React from 'react';
import { useT } from '@/lib/i18n';

const ClientsHeader: React.FC = () => {
  const t = useT();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-medium text-gray-900">{t('clients')}</h1>
      <p className="text-sm text-gray-500">{t('manageClientRelationships')}</p>
    </div>
  );
};

export default ClientsHeader;
