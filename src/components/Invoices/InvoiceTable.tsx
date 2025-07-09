
import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Invoice } from '@/hooks/invoices/types';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useAuth } from '@/hooks/dashboard/useAuth';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import InvoiceActionsMenu from './InvoiceActionsMenu';

interface InvoiceTableProps {
  invoices: Invoice[];
  onDownloadPDF: (id: string) => Promise<void>;
  onSendToClient: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onDownloadPDF,
  onSendToClient,
  onDeleteInvoice
}) => {
  const t = useT();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { formatCurrency } = useUserCurrency(user);
  const isRTL = language === 'ar';

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-base font-medium">{t('noInvoicesFound')}</p>
        <p className="text-gray-400 text-sm mt-1">{t('noInvoicesDescription')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className={`text-gray-500 font-medium text-xs uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('transactionId')}
            </TableHead>
            <TableHead className={`text-gray-500 font-medium text-xs uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('invoiceAmount')}
            </TableHead>
            <TableHead className={`text-gray-500 font-medium text-xs uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('projectName')}
            </TableHead>
            <TableHead className={`text-gray-500 font-medium text-xs uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('dateOfInvoice')}
            </TableHead>
            <TableHead className={`text-gray-500 font-medium text-xs uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('status')}
            </TableHead>
            <TableHead className={`text-gray-500 font-medium text-xs uppercase tracking-wide ${isRTL ? 'text-left' : 'text-right'}`}>
              {t('actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="border-gray-50 hover:bg-gray-25">
              <TableCell className={`font-mono text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                {invoice.transactionId}
              </TableCell>
              <TableCell className={`font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                {formatCurrency(invoice.amount)}
              </TableCell>
              <TableCell className={`text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {invoice.projectName}
              </TableCell>
              <TableCell className={`text-gray-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                {format(invoice.date, 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                <InvoiceActionsMenu
                  invoiceId={invoice.id}
                  onDownloadPDF={onDownloadPDF}
                  onSendToClient={onSendToClient}
                  onDeleteInvoice={onDeleteInvoice}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceTable;
