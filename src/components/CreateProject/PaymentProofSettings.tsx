
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Shield } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useT } from '@/lib/i18n';

const PaymentProofSettings = () => {
  const form = useFormContext();
  const t = useT();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          {t('paymentDeliverySettings')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="paymentProofRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-medium">
                  {t('requirePaymentProof')}
                </FormLabel>
                <FormDescription className="text-sm text-slate-600">
                  {t('paymentProofDescription')}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default PaymentProofSettings;
