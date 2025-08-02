
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CURRENCIES } from '@/lib/currency';
import { InvoiceFormData } from './types';
import { useAuth } from '@/hooks/core/useAuth';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useT } from '@/lib/i18n';
// Icons replaced with emojis

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

  // Set the user's preferred currency when component mounts only
  useEffect(() => {
    if (userCurrency && !invoiceData.currency) {
      updateField('currency', userCurrency);
    }
  }, [userCurrency, updateField]);

  const resetToDefault = () => {
    if (userCurrency) {
      updateField('currency', userCurrency);
    }
  };

  const isUsingDefault = invoiceData.currency === userCurrency;

  return (
    <Card className="card-hover">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">{t('currency')}</label>
            {userCurrency && !isUsingDefault && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefault}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <span className="text-sm mr-1">🔄</span>
                Reset to default ({userCurrency})
              </Button>
            )}
          </div>
           <Select
            value={invoiceData.currency}
            onValueChange={(value) => updateField('currency', value)}
          >
            <SelectTrigger className="border-gray-300 border">
              <SelectValue placeholder={t('selectCurrency')} />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name}
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
