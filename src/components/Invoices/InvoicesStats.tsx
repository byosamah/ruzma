
import React from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Coins, Clock, CheckCircle } from 'lucide-react';
import { Invoice } from '@/hooks/useInvoices';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useT } from '@/lib/i18n';

interface InvoicesStatsProps {
  invoices: Invoice[];
  user: User | null;
}

const InvoicesStats: React.FC<InvoicesStatsProps> = ({ invoices, user }) => {
  const t = useT();
  const { formatCurrency } = useUserCurrency(user);

  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'sent' || invoice.status === 'draft').length;

  const stats = [
    {
      icon: FileText,
      label: t('totalInvoices'),
      value: totalInvoices.toString(),
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600'
    },
    {
      icon: Coins,
      label: t('totalAmount'),
      value: formatCurrency(totalAmount),
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: CheckCircle,
      label: t('paidInvoices'),
      value: paidInvoices.toString(),
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Clock,
      label: t('pendingInvoices'),
      value: pendingInvoices.toString(),
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-none bg-gray-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 break-words">{stat.label}</p>
                  <p className="text-lg sm:text-xl font-medium text-gray-900 break-words word-break">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InvoicesStats;
