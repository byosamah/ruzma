
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';
import { useT } from '@/lib/i18n';

const PaymentProofSettings = () => {
  const t = useT();
  const form = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">
          {t('paymentDeliverySettings')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="requirePaymentProof"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t('requirePaymentProof')}
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  {t('requirePaymentProofDescription')}
                </div>
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

        <FormField
          control={form.control}
          name="enableDeliverableWatermark"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t('enableDeliverableWatermark')}
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  {t('enableDeliverableWatermarkDescription')}
                </div>
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
