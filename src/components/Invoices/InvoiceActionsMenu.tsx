
import React, { useState } from 'react';
import { MoreHorizontal, Download, Send, Trash2, Loader2 } from 'lucide-react';
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
  onDownloadPDF: (id: string) => Promise<void>;
  onSendToClient: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
}

const InvoiceActionsMenu: React.FC<InvoiceActionsMenuProps> = ({
  invoiceId,
  onDownloadPDF,
  onSendToClient,
  onDeleteInvoice
}) => {
  const t = useT();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      await onDownloadPDF(invoiceId);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendToClient = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSending) return;
    
    setIsSending(true);
    try {
      onSendToClient(invoiceId);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      onDeleteInvoice(invoiceId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('viewMore')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleDownload} className="cursor-pointer" disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isDownloading ? 'Generating PDF...' : t('downloadPDF')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSendToClient} className="cursor-pointer" disabled={isSending}>
          {isSending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {isSending ? 'Sending to client...' : t('sendToClient')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('deleteInvoice')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InvoiceActionsMenu;
