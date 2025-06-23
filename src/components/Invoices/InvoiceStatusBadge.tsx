
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/hooks/useInvoices';
import { useT } from '@/lib/i18n';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const t = useT();

  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Paid',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'sent':
        return {
          label: 'Sent',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'overdue':
        return {
          label: 'Overdue',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'draft':
        return {
          label: 'Draft',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} font-medium`}
    >
      {config.label}
    </Badge>
  );
};

export default InvoiceStatusBadge;
