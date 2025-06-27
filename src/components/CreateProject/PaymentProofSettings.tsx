
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Shield } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useT } from '@/lib/i18n';

const PaymentProofSettings = () => {
  const form = useFormContext();
  const t = useT();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">{t('paymentDeliverySettings')}</h3>
        </div>
      </div>
      
      <div className="p-6">
        <FormField
          control={form.control}
          name="paymentProofRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start justify-between space-y-0 gap-4">
              <div className="space-y-1 flex-1">
                <FormLabel className="text-sm font-medium text-gray-900">
                  {t('requirePaymentProof')}
                </FormLabel>
                <FormDescription className="text-xs text-gray-600 leading-relaxed">
                  {t('paymentProofDescription')}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PaymentProofSettings;
