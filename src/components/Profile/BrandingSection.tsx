
import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Upload, Palette } from 'lucide-react';
import { ProfileFormData } from '@/hooks/profile/types';

interface BrandingSectionProps {
  formData: ProfileFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLogoUpload: (file: File) => void;
}

export const BrandingSection = ({
  formData,
  onFormChange,
  onLogoUpload
}: BrandingSectionProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoUpload(file);
    }
    // Reset file input
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  return (
    <>
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Brand Elements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand Logo */}
          <div className="space-y-2">
            <Label>Brand Logo</Label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Brand Logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <Upload className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Brand Color */}
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Brand Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={formData.primaryColor || '#050c1e'}
                onChange={onFormChange}
                className="w-10 h-10 border rounded-md cursor-pointer"
              />
              <Input
                value={formData.primaryColor || '#050c1e'}
                onChange={onFormChange}
                name="primaryColor"
                placeholder="#050c1e"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
