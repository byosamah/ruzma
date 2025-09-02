import React, { useState } from 'react';
import { Send, Upload, X, Image } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { RevisionData, canRequestRevision, getRemainingRevisions } from '@/lib/revisionUtils';
import { supabase } from '@/integrations/supabase/client';

interface RevisionRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string, images: string[]) => void;
  revisionData: RevisionData;
  milestoneTitle: string;
  token?: string; // Client access token
  milestoneId?: string; // Milestone ID for uploads
}

const RevisionRequestDialog = ({
  isOpen,
  onClose,
  onSubmit,
  revisionData,
  milestoneTitle,
  token,
  milestoneId
}) => {
  const t = useT();
  const [feedback, setFeedback] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const remainingRevisions = getRemainingRevisions(revisionData);
  const canRequest = canRequestRevision(revisionData);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.error('Please select only image files');
      return;
    }
    
    if (images.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    setImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!token || !milestoneId) {
      throw new Error('Missing token or milestone ID for image upload');
    }

    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('milestoneId', milestoneId);
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('upload-revision-image', {
        body: formData
      });

      if (error) {
        // Error uploading image handled by UI
        throw error;
      }

      return data.url;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback for the revision');
      return;
    }

    if (!canRequest) {
      toast.error('Revision limit reached');
      return;
    }

    setUploading(true);
    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length) {
        imageUrls = await uploadImages(images);
      }
      
      await onSubmit(feedback.trim(), imageUrls);
      
      // Reset form
      setFeedback('');
      setImages([]);
      onClose();
      
      toast.success('Revision request sent successfully');
    } catch (error) {
      // Error submitting revision request handled by UI
      toast.error('Failed to submit revision request');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Request Revision - {milestoneTitle}
          </DialogTitle>
          <DialogDescription>Provide feedback and request changes to this milestone</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Revision Counter */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Revisions Available</span>
              <span className="text-sm">
                {remainingRevisions === null 
                  ? 'Unlimited' 
                  : `${remainingRevisions} remaining`
                }
              </span>
            </div>
            {!canRequest && (
              <p className="text-sm text-destructive mt-2">
                You have reached the maximum number of revisions for this milestone.
              </p>
            )}
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Revision Feedback <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Please describe what changes you'd like to see..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="resize-none"
              disabled={!canRequest}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Attach Reference Images (Optional)</label>
            
            {/* Upload Button */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('revision-images')?.click()}
                disabled={!canRequest || images.length >= 5}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Images
              </Button>
              <span className="text-xs text-muted-foreground">
                Max 5 images, 10MB each
              </span>
            </div>

            <input
              id="revision-images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={!canRequest}
            />

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <p className="text-xs text-center mt-1 truncate">
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canRequest || !feedback.trim() || uploading}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Revision Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RevisionRequestDialog;