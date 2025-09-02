
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ShadcnFormDialog } from '@/components/shared/dialogs/ShadcnFormDialog';
import { createClientSchema } from '@/lib/validators/client';
import { useT } from '@/lib/i18n';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateClientFormData) => Promise<boolean>;
}

function AddClientDialog({
  open,
  onOpenChange,
  onSubmit
}: AddClientDialogProps) {
  const t = useT();
  
  const form = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: '',
      email: '',
      notes: '',
    },
  });

  const handleSubmit = async (data: CreateClientFormData) => {
    const success = await onSubmit(data);
    
    if (success) {
      form.reset();
    }
  };

  const handleCancel = () => {
    form.reset();
  };

  return (
    <ShadcnFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('addNewClient')}
      form={form}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel={t('addClient')}
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

export default AddClientDialog;
