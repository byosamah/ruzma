
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ShadcnFormDialog } from '@/components/shared/dialogs/ShadcnFormDialog';
import { changePasswordSchema } from '@/lib/validators/auth';
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
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

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
