
import React, { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { ClientWithProjectCount } from '@/types/client';

interface DeleteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientWithProjectCount | null;
  onConfirm: (clientId: string) => Promise<boolean>;
}

const DeleteClientDialog: React.FC<DeleteClientDialogProps> = ({
  open,
  onOpenChange,
  client,
  onConfirm
}) => {
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
          <AlertDialogTitle>Delete Client</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{client?.name}</strong>? 
            {client?.project_count > 0 && (
              <span className="block mt-2 text-amber-600">
                This client has {client.project_count} connected project(s). 
                The projects will not be deleted, but the client reference will be removed.
              </span>
            )}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteClientDialog;
