
import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/hooks/useInvoices';
import { useT } from '@/lib/i18n';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  const t = useT();

  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return {
          variant: 'default' as const,
          className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
          text: t('paid')
        };
      case 'sent':
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
          text: t('sent')
        };
      case 'overdue':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
          text: t('overdue')
        };
      case 'draft':
        return {
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
          text: t('draft')
        };
      case 'cancelled':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
          text: t('cancelled')
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
