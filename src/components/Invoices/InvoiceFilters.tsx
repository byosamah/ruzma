
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { InvoiceStatus } from '@/hooks/useInvoices';
import { useT } from '@/lib/i18n';

interface InvoiceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: InvoiceStatus | 'all';
  onStatusFilterChange: (value: InvoiceStatus | 'all') => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  const t = useT();

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={t('searchInvoices')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="sm:w-48">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg">
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default InvoiceFilters;
