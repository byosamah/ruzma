
import React, { useState } from 'react';
// Icons replaced with emojis
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
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
          <span className="text-lg text-gray-500">⋯</span>
          <span className="sr-only">{t('viewMore')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 border-gray-200">
        <DropdownMenuItem 
          onClick={handleDownload} 
          className="cursor-pointer text-gray-700 hover:bg-gray-50" 
          disabled={isDownloading}
        >
          {isDownloading ? (
            <span className="mr-2 text-lg animate-spin">🔄</span>
          ) : (
            <span className="mr-2 text-lg">📥</span>
          )}
          {isDownloading ? 'Generating...' : t('downloadPDF')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleSendToClient} 
          className="cursor-pointer text-gray-700 hover:bg-gray-50" 
          disabled={isSending}
        >
          {isSending ? (
            <span className="mr-2 text-lg animate-spin">🔄</span>
          ) : (
            <span className="mr-2 text-lg">📧</span>
          )}
          {isSending ? 'Sending...' : t('sendToClient')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
        >
          <span className="mr-2 text-lg">🗑️</span>
          {t('deleteInvoice')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InvoiceActionsMenu;
