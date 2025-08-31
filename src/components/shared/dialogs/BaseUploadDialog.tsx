import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BaseUploadDialogProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  onUpload: (file: File) => Promise<boolean>;
  acceptedTypes?: string;
  maxSizeMB?: number;
  uploadLabel?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const BaseUploadDialog = ({
  trigger,
  title,
  description,
  onUpload,
  acceptedTypes = "image/*",
  maxSizeMB = 5,
  uploadLabel = "Upload",
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: BaseUploadDialogProps) => {
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSizeMB}MB`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const success = await onUpload(selectedFile);
      
      if (success) {
        toast({
          title: "Upload successful",
          description: "File has been uploaded successfully."
        });
        setSelectedFile(null);
        setOpen(false);
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload file. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the file.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUploading(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !uploading) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </DialogHeader>
      
      <div className="space-y-4">
        {children}
        
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <File className="h-4 w-4" />
              <span>{selectedFile.name}</span>
              <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button 
          variant="outline" 
          onClick={() => handleOpenChange(false)}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="min-w-[80px]"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {uploadLabel}
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
};