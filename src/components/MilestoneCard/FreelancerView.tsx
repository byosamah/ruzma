
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye, ExternalLink, Download, FileUp, Upload, Pencil } from 'lucide-react';
import { Milestone } from './types';

interface FreelancerViewProps {
  milestone: Milestone;
  onApprove?: (milestoneId: string) => void;
  onReject?: (milestoneId: string) => void;
  onDeliverableUpload?: (milestoneId: string, file: File, watermarkText?: string) => void;
  onShowPaymentProofPreview: () => void;
  onUpdateWatermark?: (milestoneId: string, watermarkText: string) => void;
}

const FreelancerView: React.FC<FreelancerViewProps> = ({
  milestone,
  onApprove,
  onReject,
  onDeliverableUpload,
  onShowPaymentProofPreview,
  onUpdateWatermark
}) => {
  const [watermark, setWatermark] = useState(milestone.watermarkText ?? '');
  const [editing, setEditing] = useState(false);

  const handleDeliverableFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onDeliverableUpload) {
      onDeliverableUpload(milestone.id, file, watermark);
    }
  };

  const handleWatermarkSave = () => {
    onUpdateWatermark?.(milestone.id, watermark);
    setEditing(false);
  };

  const renderPaymentProofSection = () => {
    if (milestone.status !== 'payment_submitted' || !milestone.paymentProofUrl) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Payment proof submitted by client</p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShowPaymentProofPreview}
              className="flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(milestone.paymentProofUrl, '_blank')}
              className="flex items-center space-x-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open</span>
            </Button>
          </div>
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
    );
  };

  const renderDeliverableSection = () => (
    <div className="pt-2 border-t">
      <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
        Deliverable: 
        <Button variant="ghost" size="sm" onClick={() => setEditing(e => !e)}>
          <Pencil className="w-4 h-4 mr-1" />
          {editing ? "Cancel" : "Edit Watermark"}
        </Button>
      </p>
      {editing && (
        <div className="mb-2 flex gap-2 items-center">
          <input
            className="w-52 border rounded px-2 py-1 text-sm"
            value={watermark}
            onChange={e => setWatermark(e.target.value)}
            placeholder="e.g. Pending Payment"
          />
          <Button size="sm" onClick={handleWatermarkSave}>
            Save
          </Button>
        </div>
      )}
      {!editing && (
        <div className="mb-2 text-xs text-slate-600">
          <span className="bg-slate-50 px-2 py-1 rounded">
            Watermark: <b>{watermark || '[none]'}</b>
          </span>
        </div>
      )}

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
  );

  return (
    <div className="space-y-3">
      {renderPaymentProofSection()}
      {milestone.status === 'pending' && (
        <p className="text-sm text-slate-600">Waiting for client payment...</p>
      )}
      {milestone.status === 'approved' && (
        <p className="text-sm text-green-600">Payment approved. Client can download deliverable.</p>
      )}
      {renderDeliverableSection()}
    </div>
  );
};

export default FreelancerView;
