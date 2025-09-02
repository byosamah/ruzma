
import { Button } from '@/components/ui/button';
// Icons replaced with emojis
import { useT } from '@/lib/i18n';

interface InvoiceActionsProps {
  onSend: () => void;
  isLoading?: boolean;
}

const InvoiceActions = ({
  onSend,
  isLoading = false
}) => {
  const t = useT();

  return (
    <div className="flex justify-end">
      <Button 
        onClick={onSend} 
        className="px-8"
        disabled={isLoading}
      >
        <span className="text-lg mr-2">📄</span>
        {t('createInvoice')}
      </Button>
    </div>
  );
};

export default InvoiceActions;
