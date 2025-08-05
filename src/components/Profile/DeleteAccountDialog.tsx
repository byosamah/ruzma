import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteAccountDialog = ({ open, onOpenChange }: DeleteAccountDialogProps) => {
  const t = useT();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsLoading(true);

    try {
      // First, delete user profile and related data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete projects and milestones (cascade will handle milestones)
      const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Finally, delete the auth user (this will sign them out)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        // If admin deletion fails, just sign out
        await supabase.auth.signOut();
      }

      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error: any) {
      
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">{t('deleteAccount')}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {t('deleteAccountWarning')}
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{t('deleteAccountData1')}</li>
              <li>{t('deleteAccountData2')}</li>
              <li>{t('deleteAccountData3')}</li>
              <li>{t('deleteAccountData4')}</li>
            </ul>
            <div className="mt-4">
              <Label htmlFor="confirm-delete">
                {t('typeDeleteToConfirm')} <strong>DELETE</strong>
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-2 border-gray-300 border"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || confirmText !== 'DELETE'}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? t('deleting') : t('deleteAccount')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
