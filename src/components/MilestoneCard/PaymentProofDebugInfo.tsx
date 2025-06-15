
import React from 'react';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from './utils';

interface PaymentProofDebugInfoProps {
  paymentProofUrl: string;
}

const PaymentProofDebugInfo: React.FC<PaymentProofDebugInfoProps> = ({ paymentProofUrl }) => {
  return (
    <div className="mb-2 text-xs text-blue-500 break-all">
      <span>Payment Proof Raw URL: </span>
      <a href={paymentProofUrl} target="_blank" rel="noopener noreferrer" className="underline mr-2">
        {paymentProofUrl}
      </a>
      <Button
        variant="ghost"
        size="sm"
        className="px-2 py-1"
        onClick={() => copyToClipboard(paymentProofUrl)}
      >
        Copy URL
      </Button>
    </div>
  );
};

export default PaymentProofDebugInfo;
