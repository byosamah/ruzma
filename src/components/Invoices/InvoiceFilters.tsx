
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Icons replaced with emojis
import { InvoiceStatus } from '@/hooks/useInvoices';
import { useT } from '@/lib/i18n';

interface InvoiceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: InvoiceStatus | 'all';
  onStatusChange: (value: InvoiceStatus | 'all') => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange
}) => {
  const t = useT();

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <Input
          placeholder={t('searchInvoices')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 border-gray-300 border"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-40 border-gray-300 border">
          <SelectValue placeholder={t('status')} />
        </SelectTrigger>
        <SelectContent className="border-gray-200">
          <SelectItem value="all">{t('allStatus')}</SelectItem>
          <SelectItem value="draft">{t('draft')}</SelectItem>
          <SelectItem value="sent">{t('sent')}</SelectItem>
          <SelectItem value="paid">{t('paid')}</SelectItem>
          <SelectItem value="overdue">{t('overdue')}</SelectItem>
          <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default InvoiceFilters;
