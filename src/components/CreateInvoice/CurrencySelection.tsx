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
const CurrencySelection: React.FC<CurrencySelectionProps> = ({
  invoiceData,
  updateField
}) => {
  const {
    user
  } = useAuth();
  const {
    currency: userCurrency
  } = useUserCurrency(user);

  // Set the user's preferred currency when component mounts or user currency changes
  useEffect(() => {
    if (userCurrency && userCurrency !== invoiceData.currency) {
      updateField('currency', userCurrency);
    }
  }, [userCurrency, invoiceData.currency, updateField]);
  return;
};
export default CurrencySelection;