
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ShadcnFormDialog } from '@/components/shared/dialogs/ShadcnFormDialog';
import { editClientSchema } from '@/lib/validators/client';
import { ClientWithProjectCount } from '@/types/client';
import { useT } from '@/lib/i18n';

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientWithProjectCount | null;
  onSubmit: (clientId: string, data: EditClientFormData) => Promise<boolean>;
}

function EditClientDialog({
  open,
  onOpenChange,
  client,
  onSubmit
}: EditClientDialogProps) {
  const t = useT();
  
  const form = useForm<EditClientFormData>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      name: '',
      email: '',
      notes: '',
    },
  });

  // Update form when client changes
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name || '',
        email: client.email || '',
        notes: client.notes || '',
      });
    }
  }, [client, form]);

  const handleSubmit = async (data: EditClientFormData) => {
    if (!client) return;
    
    const success = await onSubmit(client.id, data);
    
    if (success) {
      // Form dialog will close automatically on success
    }
  };

  if (!client) {
    return null;
  }

  return (
    <ShadcnFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('editClient')}
      form={form}
      onSubmit={handleSubmit}
      submitLabel={t('saveChanges')}
      cancelLabel={t('cancel')}
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('clientName')} *</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t('enterClientName')}
                className="border-gray-300"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('clientEmail')} *</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder={t('enterClientEmail')}
                className="border-gray-300"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ShadcnFormDialog>
  );
}

export default EditClientDialog;
