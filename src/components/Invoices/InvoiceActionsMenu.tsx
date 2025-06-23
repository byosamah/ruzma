
import React from 'react';
import { MoreHorizontal, Download, Send, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n';

interface InvoiceActionsMenuProps {
  invoiceId: string;
  onDownloadPDF: (id: string) => void;
  onResendInvoice: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
}

const InvoiceActionsMenu: React.FC<InvoiceActionsMenuProps> = ({
  invoiceId,
  onDownloadPDF,
  onResendInvoice,
  onDeleteInvoice
}) => {
  const t = useT();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('viewMore')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDownloadPDF(invoiceId)}>
          <Download className="mr-2 h-4 w-4" />
          {t('downloadPDF')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onResendInvoice(invoiceId)}>
          <Send className="mr-2 h-4 w-4" />
          {t('resendInvoice')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDeleteInvoice(invoiceId)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('deleteInvoice')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InvoiceActionsMenu;
