
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentUploadDialogProps {
  milestoneId: string;
  onPaymentUpload?: (milestoneId: string, file: File) => Promise<boolean>;
  trigger: React.ReactNode;
}

function PaymentUploadDialog({
  milestoneId,
  onPaymentUpload,
  trigger
}: PaymentUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !onPaymentUpload) return;

    setUploading(true);
    try {
      const success = await onPaymentUpload(milestoneId, selectedFile);
      if (success) {
        toast.success('Payment proof uploaded successfully');
        setOpen(false);
        setSelectedFile(null);
      } else {
        toast.error('Failed to upload payment proof');
      }
    } catch (error) {
      toast.error('Error uploading payment proof');
      // Upload error handled by UI
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Payment Proof</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-file">Select payment receipt or proof</Label>
            <Input
              id="payment-file"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="mt-1 border-gray-300 border"
            />
          </div>
          
          {selectedFile && (
            <div className="text-sm text-slate-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentUploadDialog;
