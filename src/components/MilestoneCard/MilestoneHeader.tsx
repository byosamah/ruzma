
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { getStatusColor, getStatusIcon } from './utils';
import { useT, TranslationKey } from '@/lib/i18n';

interface MilestoneHeaderProps {
  title: string;
  description: string;
  price: number;
  status: string;
  currency: CurrencyCode;
}

const MilestoneHeader: React.FC<MilestoneHeaderProps> = ({
  title,
  description,
  price,
  status,
  currency
}) => {
  const StatusIcon = getStatusIcon(status);
  const t = useT();
  const statusKey = `status_${status}` as TranslationKey;

  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-800">
            {formatCurrency(price, currency)}
          </div>
          <Badge className={`mt-1 ${getStatusColor(status)} flex items-center space-x-1`}>
            <StatusIcon className="w-4 h-4" />
            <span className="capitalize">{t(statusKey)}</span>
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
};

export default MilestoneHeader;
