import { useCallback } from 'react';
import { ProjectTemplate } from '@/types/projectTemplate';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { useT } from '@/lib/i18n';

export const useTemplateOperations = () => {
  const { navigate } = useLanguageNavigation();
  const t = useT();

  const createProjectFromTemplate = useCallback((template: ProjectTemplate) => {
    // Navigate to create project with template data
    navigate('/create-project', {
      state: {
        template: {
          name: template.name,
          brief: template.brief,
          milestones: template.milestones,
          contract_required: template.contract_required,
          payment_proof_required: template.payment_proof_required,
          contract_terms: template.contract_terms,
          payment_terms: template.payment_terms,
          project_scope: template.project_scope,
          revision_policy: template.revision_policy,
        }
      }
    });
  }, [navigate]);

  const confirmDeleteTemplate = useCallback((): boolean => {
    return confirm(t('deleteTemplateConfirmation'));
  }, [t]);

  return {
    createProjectFromTemplate,
    confirmDeleteTemplate,
  };
};