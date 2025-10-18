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
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      // Call delete-account Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmation: confirmText
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account');
      }

      // Success! Sign out and redirect
      toast.success('Account deleted successfully');

      // CRITICAL: Sign out FIRST to clear session
      await supabase.auth.signOut();

      // Clear local storage to remove any cached data
      localStorage.clear();
      sessionStorage.clear();

      // Small delay to ensure sign-out completes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force redirect to login page (not homepage to avoid auth loops)
      window.location.href = '/en/login';
    } catch (error: Error | unknown) {
      console.error('Delete account error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account. Please contact support.');
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
