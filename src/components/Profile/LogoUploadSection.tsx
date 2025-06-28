
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { ProfileFormData } from '@/hooks/profile/types';

interface LogoUploadSectionProps {
  formData: ProfileFormData;
  onLogoUpload: (file: File) => void;
}

export const LogoUploadSection = ({
  formData,
  onLogoUpload
}: LogoUploadSectionProps) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Enhanced file validation
      const MAX_LOGO_SIZE = 1024 * 1024; // 1MB
      const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];
      
      if (file.size > MAX_LOGO_SIZE) {
        alert('Logo file must be less than 1MB');
        return;
      }
      
      if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
        alert('Logo must be JPEG, PNG, or SVG format');
        return;
      }
      
      onLogoUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="logo" className="text-sm font-medium text-gray-700">
        Logo
      </Label>
      <div className="flex items-center space-x-4">
        <Input
          id="logo"
          type="file"
          onChange={handleLogoUpload}
          accept="image/jpeg,image/png,image/svg+xml"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('logo')?.click()}
          className="border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Logo
        </Button>
        {formData.logoUrl && (
          <img
            src={formData.logoUrl}
            alt="Logo preview"
            className="w-8 h-8 object-contain border border-gray-200 rounded"
          />
        )}
      </div>
      <p className="text-xs text-gray-500">
        JPEG, PNG, or SVG. Max 1MB.
      </p>
    </div>
  );
};
