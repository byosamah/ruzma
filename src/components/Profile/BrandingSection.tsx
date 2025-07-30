
import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Upload, Palette } from 'lucide-react';
import { ProfileFormData } from '@/hooks/profile/types';
import { useT } from '@/lib/i18n';
import { brandingService } from '@/services/brandingService';
import { useAuth } from '@/hooks/core/useAuth';
import { toast } from 'sonner';

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
  const t = useT();
  const { user } = useAuth();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      try {
        toast.loading('Uploading logo...');
        
        // Upload logo using brandingService
        const result = await brandingService.uploadLogo(file, user.id);
        
        if (result.success && result.url) {
          // Update the formData with the new logo URL
          const syntheticEvent = {
            target: {
              name: 'logoUrl',
              value: result.url
            }
          } as React.ChangeEvent<HTMLInputElement>;
          
          onFormChange(syntheticEvent);
          toast.dismiss();
          toast.success('Logo uploaded successfully!');
        } else {
          toast.dismiss();
          toast.error(result.error || 'Failed to upload logo');
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        toast.dismiss();
        toast.error('Failed to upload logo');
      }
    }
    
    // Reset file input
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  return (
    <>
      <Separator className="bg-gray-100" />
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          {t('brandElements')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand Logo */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-700">{t('brandLogo')}</Label>
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 flex-shrink-0">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Brand Logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <Upload className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
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
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 mb-1"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  {t('upload')}
                </Button>
                <p className="text-xs text-gray-500">PNG, JPG {t('upTo')} 2{t('mb')}</p>
              </div>
            </div>
          </div>

          {/* Brand Color */}
          <div className="space-y-2">
            <Label htmlFor="primaryColor" className="text-sm text-gray-700">{t('brandColor')}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={formData.primaryColor || '#050c1e'}
                onChange={onFormChange}
                className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
              />
              <Input
                value={formData.primaryColor || '#050c1e'}
                onChange={onFormChange}
                name="primaryColor"
                placeholder="#050c1e"
                className="flex-1 border-gray-200 focus:border-gray-300 focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
