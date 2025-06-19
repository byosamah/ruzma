
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { getStatusColor, getStatusIcon } from './utils';
import { useT, TranslationKey } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const statusKey = `status_${status}` as TranslationKey;

  if (isMobile) {
    return (
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <CardTitle className="text-xl font-semibold text-slate-900 leading-tight">{title}</CardTitle>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(price, currency)}
            </div>
            <Badge className={`${getStatusColor(status)} flex items-center gap-1.5 px-3 py-1`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span className="capitalize text-xs font-medium">{t(statusKey)}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
    );
  }

  return (
    <CardHeader className="px-6 pt-6 pb-4">
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1 space-y-2">
          <CardTitle className="text-xl font-semibold text-slate-900">{title}</CardTitle>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{description}</p>
        </div>
        <div className="flex flex-col items-end space-y-3 flex-shrink-0">
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(price, currency)}
          </div>
          <Badge className={`${getStatusColor(status)} flex items-center gap-1.5 px-3 py-1`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="capitalize font-medium">{t(statusKey)}</span>
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
};

export default MilestoneHeader;
