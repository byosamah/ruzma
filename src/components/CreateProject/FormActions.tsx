
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
    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
      <Button 
        type="button" 
        variant="ghost" 
        onClick={onCancel}
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      >
        {t('cancel')}
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-gray-900 hover:bg-gray-800 text-white px-6"
      >
        {isSubmitting ? t('creating') : t('createProject')}
      </Button>
    </div>
  );
};

export default FormActions;
