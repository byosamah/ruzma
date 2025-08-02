import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';
import { useBrandStyles } from '@/hooks/useBrandingSystem';

interface PaymentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<boolean>;
  milestoneTitle: string;
  milestonePrice: string;
  branding?: FreelancerBranding | null;
}

const PaymentUploadModal: React.FC<PaymentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  milestoneTitle,
  milestonePrice,
  branding,
}) => {
  const t = useT();
  const brandStyles = useBrandStyles(branding);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const success = await onUpload(file);
      if (success) {
        setUploadSuccess(true);
        setTimeout(() => {
          onClose();
          setUploadSuccess(false);
        }, 2000);
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Branded Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          branding?.primary_color 
            ? `border-[${branding.primary_color}]/20 bg-gradient-to-r from-[${branding.primary_color}]/5 to-transparent`
            : 'border-gray-100'
        }`}>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Payment Proof</h2>
            <p className="text-sm text-gray-600 mt-1">{milestoneTitle}</p>
            <p className={`text-lg font-bold mt-2 ${
              branding?.primary_color 
                ? `text-[${branding.primary_color}]`
                : 'text-emerald-600'
            }`}>
              {milestonePrice}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {uploadSuccess ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Successful!</h3>
              <p className="text-gray-600">Your payment proof has been uploaded successfully.</p>
            </motion.div>
          ) : (
            <>
              {/* Amount Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Payment Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{milestonePrice}</p>
                </div>
              </div>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive 
                    ? 'border-emerald-400 bg-emerald-50' 
                    : error 
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('payment-file-input')?.click()}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  error ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {error ? (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                {uploading ? (
                  <div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Uploading...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-900 font-medium mb-2">
                      {dragActive ? 'Drop your file here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Screenshot, photo, or scan of payment receipt
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
              </div>

              <input
                id="payment-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />

              {error && (
                <motion.div 
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Instructions */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Payment Proof Guidelines:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Upload a clear screenshot or photo of your payment confirmation</li>
                  <li>• Include transaction ID and amount if visible</li>
                  <li>• Ensure the image is readable and not blurry</li>
                  <li>• Bank transfers, card payments, and digital wallet receipts accepted</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => document.getElementById('payment-file-input')?.click()}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Choose File'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentUploadModal;