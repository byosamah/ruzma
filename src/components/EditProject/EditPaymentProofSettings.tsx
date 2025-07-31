import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useT } from '@/lib/i18n';

interface EditPaymentProofSettingsProps {
  paymentProofRequired: boolean;
  onPaymentProofRequiredChange: (required: boolean) => void;
}

const EditPaymentProofSettings: React.FC<EditPaymentProofSettingsProps> = ({
  paymentProofRequired,
  onPaymentProofRequiredChange
}) => {
  const t = useT();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg text-blue-600">🛡️</span>
          <h3 className="text-sm font-medium text-gray-900">{t('paymentDeliverySettings')}</h3>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-4">
          <div className="space-y-1 flex-1">
            <label className="text-sm font-medium text-gray-900">
              {t('requirePaymentProof')}
            </label>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('paymentProofDescription')}
            </p>
          </div>
          <Switch
            checked={paymentProofRequired}
            onCheckedChange={onPaymentProofRequiredChange}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default EditPaymentProofSettings;