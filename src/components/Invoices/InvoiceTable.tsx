
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
  const { formatCurrency } = useUserCurrency(user);

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t('noInvoicesFound')}</p>
        <p className="text-gray-400 mt-2">{t('noInvoicesDescription')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('transactionId')}</TableHead>
            <TableHead>{t('invoiceAmount')}</TableHead>
            <TableHead>{t('projectName')}</TableHead>
            <TableHead>{t('dateOfInvoice')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
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
              <TableCell>{invoice.projectName}</TableCell>
              <TableCell>
                {format(invoice.date, 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-right">
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
