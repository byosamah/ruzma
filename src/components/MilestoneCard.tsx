import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Download, Upload, FileUp, Eye, X } from 'lucide-react';
import { formatCurrency, CurrencyCode } from '@/lib/currency';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'payment_submitted' | 'approved' | 'rejected';
  deliverable?: {
    name: string;
    size: number;
    url?: string;
  };
  paymentProofUrl?: string;
}

interface MilestoneCardProps {
  milestone: Milestone;
  onApprove?: (milestoneId: string) => void;
  onReject?: (milestoneId: string) => void;
  isClient?: boolean;
  onPaymentUpload?: (milestoneId: string, file: File) => void;
  onDeliverableUpload?: (milestoneId: string, file: File) => void;
  onDeliverableDownload?: (milestoneId: string) => void;
  currency?: CurrencyCode;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ 
  milestone, 
  onApprove, 
  onReject, 
  isClient = false,
  onPaymentUpload,
  onDeliverableUpload,
  onDeliverableDownload,
  currency = 'USD'
}) => {
  const [showPaymentProofPreview, setShowPaymentProofPreview] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'payment_submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'payment_submitted': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handlePaymentFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onPaymentUpload) {
      onPaymentUpload(milestone.id, file);
    }
  };

  const handleDeliverableFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onDeliverableUpload) {
      onDeliverableUpload(milestone.id, file);
    }
  };

  return (
    <>
      <Card className={`transition-all duration-200 ${getStatusColor(milestone.status)} border-l-4`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">{milestone.title}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-800">
                {formatCurrency(milestone.price, currency)}
              </div>
              <Badge className={`mt-1 ${getStatusColor(milestone.status)} flex items-center space-x-1`}>
                {getStatusIcon(milestone.status)}
                <span className="capitalize">{milestone.status.replace('_', ' ')}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isClient ? (
              // Client view
              <div className="space-y-3">
                {milestone.status === 'pending' && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Upload Payment Proof:</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handlePaymentFileUpload}
                        className="hidden"
                        id={`payment-${milestone.id}`}
                      />
                      <label htmlFor={`payment-${milestone.id}`}>
                        <Button asChild size="sm">
                          <span className="cursor-pointer flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Proof
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                )}
                
                {milestone.status === 'payment_submitted' && (
                  <p className="text-sm text-blue-600">Payment proof submitted. Waiting for approval...</p>
                )}
                
                {milestone.status === 'approved' && milestone.deliverable && (
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => onDeliverableDownload?.(milestone.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download {milestone.deliverable.name}
                  </Button>
                )}
                
                {milestone.status === 'rejected' && (
                  <p className="text-sm text-red-600">Payment was rejected. Please resubmit with correct details.</p>
                )}
              </div>
            ) : (
              // Freelancer view
              <div className="space-y-3">
                {milestone.status === 'payment_submitted' && milestone.paymentProofUrl && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Payment proof submitted by client</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPaymentProofPreview(true)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </Button>
                    </div>
                    
                    {onApprove && onReject && (
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => onApprove(milestone.id)} 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Payment
                        </Button>
                        <Button 
                          onClick={() => onReject(milestone.id)} 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {milestone.status === 'pending' && (
                  <p className="text-sm text-slate-600">Waiting for client payment...</p>
                )}
                
                {milestone.status === 'approved' && (
                  <p className="text-sm text-green-600">Payment approved. Client can download deliverable.</p>
                )}
                
                {/* Deliverable upload section for freelancers */}
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-slate-700 mb-2">Deliverable:</p>
                  {milestone.deliverable ? (
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Download className="w-4 h-4" />
                        <span>{milestone.deliverable.name}</span>
                        <span className="text-xs text-slate-400">
                          ({(milestone.deliverable.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          onChange={handleDeliverableFileUpload}
                          className="hidden"
                          id={`deliverable-${milestone.id}`}
                        />
                        <label htmlFor={`deliverable-${milestone.id}`}>
                          <Button asChild size="sm" variant="outline">
                            <span className="cursor-pointer flex items-center">
                              <FileUp className="w-4 h-4 mr-1" />
                              Replace
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        onChange={handleDeliverableFileUpload}
                        className="hidden"
                        id={`deliverable-${milestone.id}`}
                      />
                      <label htmlFor={`deliverable-${milestone.id}`}>
                        <Button asChild size="sm">
                          <span className="cursor-pointer flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Deliverable
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Proof Preview Modal */}
      {showPaymentProofPreview && milestone.paymentProofUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Payment Proof Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPaymentProofPreview(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center">
                {milestone.paymentProofUrl.toLowerCase().includes('.pdf') ? (
                  <iframe
                    src={milestone.paymentProofUrl}
                    className="w-full h-96 border rounded"
                    title="Payment Proof PDF"
                  />
                ) : (
                  <img
                    src={milestone.paymentProofUrl}
                    alt="Payment Proof"
                    className="max-w-full max-h-96 object-contain rounded"
                  />
                )}
              </div>
              <div className="flex justify-center space-x-2 mt-4">
                {onApprove && (
                  <Button 
                    onClick={() => {
                      onApprove(milestone.id);
                      setShowPaymentProofPreview(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Payment
                  </Button>
                )}
                {onReject && (
                  <Button 
                    onClick={() => {
                      onReject(milestone.id);
                      setShowPaymentProofPreview(false);
                    }}
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
      )}
    </>
  );
};

export default MilestoneCard;
