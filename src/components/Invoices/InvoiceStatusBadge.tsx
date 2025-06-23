
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/hooks/useInvoices';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'default'; // Green
      case 'sent':
        return 'secondary'; // Blue
      case 'overdue':
        return 'destructive'; // Red
      case 'draft':
        return 'outline'; // Gray
      case 'cancelled':
        return 'destructive'; // Red
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'sent':
        return 'Sent';
      case 'overdue':
        return 'Overdue';
      case 'draft':
        return 'Draft';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <Badge variant={getStatusVariant(status)} className="capitalize">
      {getStatusText(status)}
    </Badge>
  );
};

export default InvoiceStatusBadge;
