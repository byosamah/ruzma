// Lazy-loaded EditContractDialog to reduce bundle size
// Contract editing involves heavy form processing and PDF preview

import { lazy } from 'react';

export const EditContractDialog = lazy(() => 
  import('./EditContractDialog').then(module => ({
    default: module.EditContractDialog
  }))
);