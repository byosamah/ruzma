
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import { InvoiceStatus } from '@/hooks/useInvoices';

interface InvoiceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: InvoiceStatus | 'all';
  onStatusChange: (value: InvoiceStatus | 'all') => void;
  onCreateInvoice?: () => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onCreateInvoice
}) => {
  const navigate = useNavigate();

  const handleCreateInvoice = () => {
    navigate('/create-invoice');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 border-gray-200 focus:border-gray-300 focus:ring-0"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-40 border-gray-200 focus:border-gray-300 focus:ring-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="border-gray-200">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleCreateInvoice} 
        className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Invoice
      </Button>
    </div>
  );
};

export default InvoiceFilters;
