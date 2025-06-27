
import React from 'react';
import { useT } from '@/lib/i18n';

const InvoicesHeader: React.FC = () => {
  const t = useT();

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-medium text-gray-900">{t('invoices')}</h1>
      <p className="text-sm text-gray-500">{t('manageTrackInvoices')}</p>
    </div>
  );
};

export default InvoicesHeader;
