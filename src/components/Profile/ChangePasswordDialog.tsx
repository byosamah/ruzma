
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ShadcnFormDialog } from '@/components/shared/dialogs/ShadcnFormDialog';
import { changePasswordSchema, ChangePasswordFormData } from '@/lib/validators/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const t = useT();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handleSubmit = async (data: ChangePasswordFormData) => {
    try {
      // Step 1: Get current user's email from session
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        throw new Error('Unable to verify user session');
      }

      // Step 2: Re-authenticate with current password to verify it's correct
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (signInError) {
        // Current password is incorrect
        throw new Error(t('incorrectCurrentPassword') || 'Current password is incorrect');
      }

      // Step 3: Only if current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (updateError) throw updateError;

      toast.success(t('passwordUpdated') || 'Password updated successfully!');
      form.reset();
    } catch (error: Error | unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
      throw error; // Let ShadcnFormDialog handle the error state
    }
  };

  const handleCancel = () => {
    form.reset();
  };

  return (
    <ShadcnFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('changePassword')}
      description={t('newPasswordDesc')}
      form={form}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel={t('updatePassword')}
      cancelLabel={t('cancel')}
      maxWidth="sm:max-w-[425px]"
    >
      <FormField
        control={form.control}
        name="currentPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('currentPassword')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="password"
                className="border-gray-300 border"
                autoComplete="current-password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="newPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('newPassword')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="password"
                className="border-gray-300 border"
                autoComplete="new-password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmNewPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('confirmNewPassword')}</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="password"
                className="border-gray-300 border"
                autoComplete="new-password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ShadcnFormDialog>
  );
}
