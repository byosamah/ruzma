
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Invoice } from '@/hooks/useInvoices';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import InvoiceActionsMenu from './InvoiceActionsMenu';
import { useT } from '@/lib/i18n';
import { format } from 'date-fns';

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

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">{t('noInvoices')}</div>
        <div className="text-gray-400 text-sm">{t('noInvoicesDescription')}</div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-gray-900">{t('transactionId')}</TableHead>
            <TableHead className="font-semibold text-gray-900">{t('invoiceAmount')}</TableHead>
            <TableHead className="font-semibold text-gray-900">{t('projectName')}</TableHead>
            <TableHead className="font-semibold text-gray-900">{t('dateOfInvoice')}</TableHead>
            <TableHead className="font-semibold text-gray-900">{t('status')}</TableHead>
            <TableHead className="font-semibold text-gray-900 text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="hover:bg-gray-50">
              <TableCell className="font-medium text-gray-900">
                {invoice.transactionId}
              </TableCell>
              <TableCell className="text-gray-900">
                ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-gray-900">{invoice.projectName}</TableCell>
              <TableCell className="text-gray-600">
                {format(invoice.date, 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-right">
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
    </div>
  );
};

export default InvoiceTable;
