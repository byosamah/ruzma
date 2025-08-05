
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, CheckCircle, XCircle, Eye } from 'lucide-react';
import { isPdfFile, copyToClipboard } from './utils';

interface PaymentProofModalProps {
  paymentProofUrl: string;
  onClose: () => void;
  onApprove?: (milestoneId: string) => void;
  onReject?: (milestoneId: string) => void;
  milestoneId: string;
}

const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  paymentProofUrl,
  onClose,
  onApprove,
  onReject,
  milestoneId
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleImageError = () => {
    
    setImageLoadError(true);
  };

  const handleImageLoad = () => {
    
    setImageLoadError(false);
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(milestoneId);
      onClose();
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(milestoneId);
      onClose();
    }
  };

  const handleClose = () => {
    setImageLoadError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Payment Proof Preview</h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-center min-h-[300px]">
            {isPdfFile(paymentProofUrl) ? (
              <iframe
                src={paymentProofUrl}
                className="w-full h-96 border rounded"
                title="Payment Proof PDF"
                onError={() => setImageLoadError(true)}
              />
            ) : (
              <>
                {!imageLoadError ? (
                  <img
                    src={paymentProofUrl}
                    alt="Payment Proof"
                    className="max-w-full max-h-96 object-contain rounded shadow-lg"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-4 text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Unable to load image</p>
                      <p className="text-sm">The image may be corrupted or the link is invalid</p>
                      <p className="text-xs mt-2 break-all max-w-md">{paymentProofUrl}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(paymentProofUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageLoadError(false);
                          const img = document.querySelector(`img[src="${paymentProofUrl}"]`) as HTMLImageElement;
                          if (img) {
                            img.src = paymentProofUrl + '?reload=' + Date.now();
                          }
                        }}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="text-xs mt-3 text-blue-500 break-words">
            <span>Direct file URL: </span>
            <a
              href={paymentProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {paymentProofUrl}
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 py-1 ml-2"
              onClick={() => copyToClipboard(paymentProofUrl)}
            >
              Copy URL
            </Button>
          </div>
          <div className="flex justify-center space-x-2 mt-4">
            {onApprove && (
              <Button 
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Payment
              </Button>
            )}
            {onReject && (
              <Button 
                onClick={handleReject}
                variant="outline" 
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Payment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProofModal;
