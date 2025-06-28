
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Save, Loader2, CheckCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface FormActionsProps {
  isLoading: boolean;
  isSaved: boolean;
  onCancel: () => void;
}

export const FormActions = ({
  isLoading,
  isSaved,
  onCancel
}: FormActionsProps) => {
  const t = useT();

  return (
    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
        className="border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        <X className="w-4 h-4 mr-2" />
        {t('cancel')}
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
        className="bg-yellow-500 hover:bg-yellow-400 text-slate-950"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : isSaved ? (
          <CheckCircle className="w-4 h-4 mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {isLoading ? t('saving') : isSaved ? t('saved') : t('saveChanges')}
      </Button>
    </div>
  );
};
