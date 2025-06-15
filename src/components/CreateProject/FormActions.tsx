
import React from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

const FormActions = ({ isSubmitting, onCancel }: FormActionsProps) => {
  const t = useT();

  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        {t('cancel')}
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('creating') : t('createProject')}
      </Button>
    </div>
  );
};

export default FormActions;
