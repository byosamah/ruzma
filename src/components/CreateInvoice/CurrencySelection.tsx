
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCIES } from '@/lib/currency';
import { InvoiceFormData } from './types';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useT } from '@/lib/i18n';

interface CurrencySelectionProps {
  invoiceData: InvoiceFormData;
  updateField: (field: keyof InvoiceFormData, value: any) => void;
}

const CurrencySelection: React.FC<CurrencySelectionProps> = ({
  invoiceData,
  updateField
}) => {
  const t = useT();
  const { user } = useAuth();
  const { currency: userCurrency } = useUserCurrency(user);

  // Set the user's preferred currency when component mounts or user currency changes
  useEffect(() => {
    if (userCurrency && userCurrency !== invoiceData.currency) {
      updateField('currency', userCurrency);
    }
  }, [userCurrency, invoiceData.currency, updateField]);

  return (
    <Card className="card-hover">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold">{t('currency')}</label>
          <Select
            value={invoiceData.currency}
            onValueChange={(value) => updateField('currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectCurrency')} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCIES).map(([code, currency]) => (
                <SelectItem key={code} value={code}>
                  {currency.symbol.en} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencySelection;
