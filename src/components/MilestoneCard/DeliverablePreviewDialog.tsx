
import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeliverablePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  defaultWatermarkText?: string;
}

const SUPPORTED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];

function getFileType(fileName: string): 'image' | 'pdf' | 'unknown' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (SUPPORTED_IMAGE_TYPES.includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  return 'unknown';
}

const watermarkImage = async (imageUrl: string, text: string): Promise<string> => {
  // Load image
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Could not get canvas context');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      // Render watermark
      ctx.font = `${Math.floor(canvas.width / 15)}px sans-serif`;
      ctx.globalAlpha = 0.33;
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Diagonal watermark
      const angle = -Math.atan(canvas.height / canvas.width);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle);
      ctx.fillText(text, 0, 0);
      ctx.restore();
      ctx.globalAlpha = 1;
      resolve(canvas.toDataURL());
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};

export const DeliverablePreviewDialog: React.FC<DeliverablePreviewDialogProps> = ({
  open,
  onClose,
  fileUrl,
  fileName,
  defaultWatermarkText = 'SAMPLE WATERMARK',
}) => {
  const [watermarkText, setWatermarkText] = useState(defaultWatermarkText);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileType = getFileType(fileName);

  useEffect(() => {
    setWatermarkText(defaultWatermarkText);
    setPreviewUrl(null);
    setLoading(false);
  }, [open, defaultWatermarkText, fileUrl, fileName]);

  useEffect(() => {
    if (!open) return;
    if (fileType === 'image') {
      setLoading(true);
      watermarkImage(fileUrl, watermarkText)
        .then(url => setPreviewUrl(url))
        .finally(() => setLoading(false));
    } else {
      setPreviewUrl(null);
    }
  }, [open, fileUrl, watermarkText, fileType]);

  // For PDF preview: just overlay watermark text visually; never alters real file, doesn't block
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Preview Deliverable (watermarked)</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-2">
          <label className="block text-xs font-medium mb-1 text-muted-foreground">
            Watermark text
          </label>
          <input
            className="px-2 py-1 border rounded w-full text-sm mb-3"
            value={watermarkText}
            maxLength={50}
            onChange={e => setWatermarkText(e.target.value)}
            placeholder="Enter watermark text..."
          />
          {fileType === 'image' && (
            <div className="flex justify-center my-3">
              {loading ? (
                <div className="text-center py-8">Loading preview...</div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 max-w-full rounded shadow"
                  style={{ pointerEvents: 'none', userSelect: 'none', background: "#f2f2f2" }}
                  draggable={false}
                />
              ) : (
                <div className="text-center text-xs py-12 text-muted-foreground">
                  Could not load image preview.
                </div>
              )}
            </div>
          )}
          {fileType === 'pdf' && (
            <div className="relative">
              <iframe
                src={fileUrl}
                title="PDF preview"
                className="w-full h-64 border rounded"
                style={{ background: "#f2f2f2" }}
              />
              {watermarkText && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    mixBlendMode: 'multiply',
                    opacity: 0.33,
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#333",
                    transform: "rotate(-22deg)",
                    letterSpacing: 3,
                  }}
                >
                  {watermarkText}
                </div>
              )}
            </div>
          )}
          {fileType === 'unknown' && (
            <div className="py-6 text-center text-muted-foreground text-sm">
              Cannot preview this file type. Download to view.
            </div>
          )}
        </div>
        <DialogFooter className="mt-0 pb-4 pr-6 flex justify-end space-x-2">
          <Button variant="ghost" type="button" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeliverablePreviewDialog;
