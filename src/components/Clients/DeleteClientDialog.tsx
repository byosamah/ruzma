
import React, { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { ClientWithProjectCount } from '@/types/client';
import { useT } from '@/lib/i18n';

interface DeleteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientWithProjectCount | null;
  onConfirm: (clientId: string) => Promise<boolean>;
}

const DeleteClientDialog = ({
  open,
  onOpenChange,
  client,
  onConfirm
}) => {
  const t = useT();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!client) return;
    
    setIsDeleting(true);
    const success = await onConfirm(client.id);
    
    if (success) {
      onOpenChange(false);
    }
    
    setIsDeleting(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteClient')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('confirmDelete')} <strong>{client?.name}</strong>? 
            {client?.project_count > 0 && (
              <span className="block mt-2 text-amber-600">
                {t('thisClientHas')} {client.project_count} {client.project_count === 1 ? t('project') : t('projects')}. 
                {t('theProjectsWillNotBeDeleted')}
              </span>
            )}
            {t('thisActionCannotBeUndone')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? t('deleting') : t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteClientDialog;
