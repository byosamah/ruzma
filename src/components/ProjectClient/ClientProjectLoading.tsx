
import React from 'react';
import { useT } from '@/lib/i18n';
import { PageSpinner } from '@/components/shared/LoadingStates';

const ClientProjectLoading: React.FC = () => {
  const t = useT();
  return <PageSpinner text={t('loadingProject')} />;
};

export default ClientProjectLoading;
