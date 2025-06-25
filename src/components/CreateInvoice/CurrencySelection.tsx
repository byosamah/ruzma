
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCIES } from '@/lib/currency';
import { InvoiceFormData } from './types';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useUserCurrency } from '@/hooks/useUserCurrency';

interface CurrencySelectionProps {
  invoiceData: InvoiceFormData;
  updateField: (field: keyof InvoiceFormData, value: any) => void;
}

const CurrencySelection: React.FC<CurrencySelectionProps> = ({ invoiceData, updateField }) => {
  const { user } = useAuth();
  const { currency: userCurrency } = useUserCurrency(user);

  // Set the user's preferred currency when component mounts or user currency changes
  useEffect(() => {
    if (userCurrency && userCurrency !== invoiceData.currency) {
      updateField('currency', userCurrency);
    }
  }, [userCurrency, invoiceData.currency, updateField]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="font-medium">SET CURRENCY</span>
          <Select value={invoiceData.currency} onValueChange={(value) => updateField('currency', value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCIES).map(([code]) => (
                <SelectItem key={code} value={code}>
                  {code}
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
