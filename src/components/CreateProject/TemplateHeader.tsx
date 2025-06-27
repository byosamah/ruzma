import React from 'react';
import { useT } from '@/lib/i18n';

interface TemplateHeaderProps {
  hasTemplate: boolean;
}

const TemplateHeader = ({ hasTemplate }: TemplateHeaderProps) => {
  const t = useT();
  
  // This component is now integrated into the main CreateProject page header
  // Keeping it for backward compatibility but functionality moved to main page
  return null;
};

export default TemplateHeader;
