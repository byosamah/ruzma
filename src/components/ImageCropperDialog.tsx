import React, { useState, useCallback } from 'react';
import Cropper, { type Point, type Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Crop, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperDialogProps {
  image: string | null;
  onCropComplete: (croppedAreaPixels: Area) => void;
  onSave: () => void;
  onClose: () => void;
}

export const ImageCropperDialog = ({ image, onCropComplete, onSave, onClose }: ImageCropperDialogProps) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const onCropCompleteCallback = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        onCropComplete(croppedAreaPixels);
    }, [onCropComplete]);

    return (
        <Dialog open={!!image} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Crop Profile Photo</DialogTitle>
                    <DialogDescription>Adjust the crop area and zoom to select your profile picture</DialogDescription>
                </DialogHeader>
                <div className="relative h-80 bg-slate-200 rounded-md">
                    {image && (
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropCompleteCallback}
                        />
                    )}
                </div>
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <ZoomOut className="h-5 w-5 text-slate-500" />
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                        />
                        <ZoomIn className="h-5 w-5 text-slate-500" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onSave}>
                        <Crop className="w-4 h-4 mr-2" />
                        Save & Apply
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
