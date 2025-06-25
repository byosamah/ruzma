
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Send } from 'lucide-react';

interface InvoiceActionsProps {
  onSave: () => void;
  onSend: () => void;
  isLoading?: boolean;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  onSave,
  onSend,
  isLoading = false
}) => {
  return (
    <div className="flex gap-4">
      <Button 
        onClick={onSave} 
        variant="outline" 
        className="flex-1"
        disabled={isLoading}
      >
        <Save className="w-4 h-4 mr-2" />
        Save as Draft
      </Button>
      
      <Button 
        onClick={onSend} 
        className="flex-1"
        disabled={isLoading}
      >
        <Send className="w-4 h-4 mr-2" />
        Send Invoice
      </Button>
    </div>
  );
};

export default InvoiceActions;
