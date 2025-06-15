
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from './utils';
import { ExternalLink, TestTube } from 'lucide-react';

interface PaymentProofDebugInfoProps {
  paymentProofUrl: string;
}

const PaymentProofDebugInfo: React.FC<PaymentProofDebugInfoProps> = ({ paymentProofUrl }) => {
  const [testResult, setTestResult] = useState<string | null>(null);

  const testUrlAccessibility = async () => {
    try {
      const response = await fetch(paymentProofUrl, { method: 'HEAD' });
      if (response.ok) {
        setTestResult('✅ URL is accessible');
      } else {
        setTestResult(`❌ Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="mb-2 text-xs text-blue-500 break-all bg-blue-50 p-2 rounded">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium">Payment Proof Debug Info:</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 h-6"
            onClick={() => window.open(paymentProofUrl, '_blank')}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 h-6"
            onClick={testUrlAccessibility}
          >
            <TestTube className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 h-6"
            onClick={() => copyToClipboard(paymentProofUrl)}
          >
            Copy
          </Button>
        </div>
      </div>
      <div className="text-xs break-all">
        <strong>URL:</strong> {paymentProofUrl}
      </div>
      {testResult && (
        <div className="text-xs mt-1">
          <strong>Test:</strong> {testResult}
        </div>
      )}
    </div>
  );
};

export default PaymentProofDebugInfo;
