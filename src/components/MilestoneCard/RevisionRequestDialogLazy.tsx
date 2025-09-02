// Lazy-loaded RevisionRequestDialog to reduce bundle size
// Revision requests involve complex form logic and file handling

import { lazy } from 'react';

export const RevisionRequestDialog = lazy(() => 
  import('./RevisionRequestDialog').then(module => ({
    default: module.RevisionRequestDialog
  }))
);