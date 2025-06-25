
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface InvoiceActionsProps {
  onSend: () => void;
  isLoading?: boolean;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  onSend,
  isLoading = false
}) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onSend} 
        className="px-8"
        disabled={isLoading}
      >
        <FileText className="w-4 h-4 mr-2" />
        Create Invoice
      </Button>
    </div>
  );
};

export default InvoiceActions;
