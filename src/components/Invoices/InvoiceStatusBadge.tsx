
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/hooks/useInvoices';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return {
          variant: 'default' as const,
          className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
          text: 'Paid'
        };
      case 'sent':
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
          text: 'Sent'
        };
      case 'overdue':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
          text: 'Overdue'
        };
      case 'draft':
        return {
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
          text: 'Draft'
        };
      case 'cancelled':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
          text: 'Cancelled'
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-600 border-gray-200',
          text: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant} 
      className={`text-xs font-medium px-2 py-1 ${config.className}`}
    >
      {config.text}
    </Badge>
  );
};

export default InvoiceStatusBadge;
