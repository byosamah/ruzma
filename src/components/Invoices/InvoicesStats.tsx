
import { Card, CardContent } from '@/components/ui/card';
// Icons replaced with emojis
import { Invoice } from '@/hooks/useInvoices';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useT } from '@/lib/i18n';
import { UserProfile } from '@/types/profile';
import { useAuth } from '@/hooks/core/useAuth';
import { useDashboardDataQuery } from '@/hooks/dashboard/useDashboardDataQuery';
import { ServiceRegistry } from '@/services/core/ServiceRegistry';
import { useState, useEffect } from 'react';
import { CurrencyCode } from '@/lib/currency';

interface InvoicesStatsProps {
  invoices: Invoice[];
  profile: UserProfile;
}

const InvoicesStats = ({ invoices, profile }: InvoicesStatsProps) => {
  const t = useT();
  const { user } = useAuth();
  const { data } = useDashboardDataQuery(user);
  const { formatCurrency, currency } = useUserCurrency(profile);
  const [convertedTotalAmount, setConvertedTotalAmount] = useState<number>(0);

  // Convert invoice amounts from project currency to user currency
  useEffect(() => {
    const calculateConvertedTotal = async () => {
      if (!user || !invoices.length || !data?.projects) {
        setConvertedTotalAmount(0);
        return;
      }

      const conversionService = ServiceRegistry.getInstance().getConversionService(user);
      let totalConverted = 0;

      for (const invoice of invoices) {
        // Find the project associated with this invoice
        const project = data.projects.find(p => p.id === invoice.projectId);
        
        if (project && invoice.amount > 0) {
          try {
            const projectCurrency = (project.currency || project.freelancer_currency || 'USD') as CurrencyCode;
            const result = await conversionService.convertWithFormatting(
              invoice.amount,
              projectCurrency,
              currency
            );
            totalConverted += result.convertedAmount;
          } catch (error) {
            // Fallback to original amount if conversion fails
            totalConverted += invoice.amount;
          }
        } else {
          // If no project found, use raw amount
          totalConverted += invoice.amount;
        }
      }

      setConvertedTotalAmount(totalConverted);
    };

    calculateConvertedTotal();
  }, [invoices, currency, user, data?.projects]);

  const totalInvoices = invoices.length;
  const totalAmount = convertedTotalAmount;
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'sent' || invoice.status === 'draft').length;

  const stats = [
    {
      emoji: '📄',
      label: t('totalInvoices'),
      value: totalInvoices.toString(),
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600'
    },
    {
      emoji: '💰',
      label: t('totalAmount'),
      value: formatCurrency(totalAmount),
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      emoji: '✅',
      label: t('paidInvoices'),
      value: paidInvoices.toString(),
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      emoji: '⏰',
      label: t('pendingInvoices'),
      value: pendingInvoices.toString(),
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        return (
          <Card key={index} className="border-0 shadow-none bg-gray-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${stat.bgColor}`}>
                  <span className="text-xl">{stat.emoji}</span>
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
