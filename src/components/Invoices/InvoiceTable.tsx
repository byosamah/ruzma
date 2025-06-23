
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useT } from '@/lib/i18n';
import { Invoice } from '@/hooks/useInvoices';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import InvoiceActionsMenu from './InvoiceActionsMenu';

interface InvoiceTableProps {
  invoices: Invoice[];
  onDownloadPDF: (id: string) => void;
  onResendInvoice: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onDownloadPDF,
  onResendInvoice,
  onDeleteInvoice
}) => {
  const t = useT();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-gray-500 mb-2">{t('noInvoicesFound')}</div>
          <div className="text-sm text-gray-400">{t('noInvoicesDescription')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('transactionId')}</TableHead>
              <TableHead>{t('invoiceAmount')}</TableHead>
              <TableHead>{t('projectName')}</TableHead>
              <TableHead>{t('dateOfInvoice')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="w-12">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.transactionId}
                </TableCell>
                <TableCell>
                  {formatCurrency(invoice.amount)}
                </TableCell>
                <TableCell>
                  {invoice.projectName}
                </TableCell>
                <TableCell>
                  {formatDate(invoice.date)}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell>
                  <InvoiceActionsMenu
                    invoiceId={invoice.id}
                    onDownloadPDF={onDownloadPDF}
                    onResendInvoice={onResendInvoice}
                    onDeleteInvoice={onDeleteInvoice}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InvoiceTable;
