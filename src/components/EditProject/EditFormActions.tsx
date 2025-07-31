import React from 'react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

interface EditFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

const EditFormActions: React.FC<EditFormActionsProps> = ({ isSubmitting, onCancel }) => {
  const t = useT();

  return (
    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3 pt-4 border-t border-gray-100">
      <Button 
        type="button" 
        variant="ghost" 
        onClick={onCancel}
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 mobile-touch-target order-2 sm:order-1"
      >
        {t('cancel')}
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-gray-900 hover:bg-gray-800 text-white px-6 mobile-touch-target order-1 sm:order-2"
      >
        {isSubmitting ? t('saving') : t('saveChanges')}
      </Button>
    </div>
  );
};

export default EditFormActions;