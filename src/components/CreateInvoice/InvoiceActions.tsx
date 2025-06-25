
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Send } from 'lucide-react';

interface InvoiceActionsProps {
  onSave: () => void;
  onSend: () => void;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ onSave, onSend }) => {
  return (
    <div className="flex gap-4">
      <Button variant="outline" onClick={onSave} className="flex-1">
        <Save className="w-4 h-4 mr-2" />
        Save
      </Button>
      <Button onClick={onSend} className="flex-1">
        <Send className="w-4 h-4 mr-2" />
        Send
      </Button>
    </div>
  );
};

export default InvoiceActions;
