// Lazy-loaded ContractApprovalModal to reduce bundle size
// This modal contains heavy PDF handling and form logic

import { lazy } from 'react';

export const ContractApprovalModal = lazy(() => 
  import('./ContractApprovalModal').then(module => ({
    default: module.ContractApprovalModal
  }))
);