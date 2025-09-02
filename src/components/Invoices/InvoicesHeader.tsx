
import YouTubePopup from '@/components/YouTubePopup';
import { useT } from '@/lib/i18n';

const InvoicesHeader = () => {
  const t = useT();

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-medium text-gray-900">{t('invoices')}</h1>
        <YouTubePopup 
          videoId="lh-u0aR7wXI"
          buttonText={t('knowMore')}
          buttonVariant="ghost"
          buttonSize="sm"
        />
      </div>
      <p className="text-sm text-gray-500">{t('manageTrackInvoices')}</p>
    </div>
  );
};

export default InvoicesHeader;
