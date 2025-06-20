
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Upload, Eye, Palette, User, Briefcase } from 'lucide-react';
import { FreelancerBranding, BrandingFormData } from '@/types/branding';
import { useT } from '@/lib/i18n';

interface BrandingCardProps {
  branding: FreelancerBranding | null;
  onSave: (data: BrandingFormData) => Promise<boolean>;
  onLogoUpload: (file: File) => Promise<string | null>;
  isSaving: boolean;
}

export const BrandingCard: React.FC<BrandingCardProps> = ({
  branding,
  onSave,
  onLogoUpload,
  isSaving,
}) => {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<BrandingFormData>({
    freelancer_name: branding?.freelancer_name || '',
    freelancer_title: branding?.freelancer_title || '',
    freelancer_bio: branding?.freelancer_bio || '',
    primary_color: branding?.primary_color || '#4B72E5',
    secondary_color: branding?.secondary_color || '#1D3770',
    logo_url: branding?.logo_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const logoUrl = await onLogoUpload(file);
    if (logoUrl) {
      setFormData(prev => ({ ...prev, logo_url: logoUrl }));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (field: keyof BrandingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Brand Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload Section */}
          <div className="space-y-4">
            <Label>Brand Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="Brand Logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-slate-500">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Brand Colors Section */}
          <div className="space-y-4">
            <Label>Brand Colors</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="primary_color"
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-12 h-10 border rounded-md cursor-pointer"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    placeholder="#4B72E5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="secondary_color"
                    value={formData.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="w-12 h-10 border rounded-md cursor-pointer"
                  />
                  <Input
                    value={formData.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    placeholder="#1D3770"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Freelancer Info Section */}
          <div className="space-y-4">
            <Label>Freelancer Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="freelancer_name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="freelancer_name"
                    value={formData.freelancer_name}
                    onChange={(e) => handleChange('freelancer_name', e.target.value)}
                    placeholder="Your name"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="freelancer_title">Professional Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="freelancer_title"
                    value={formData.freelancer_title}
                    onChange={(e) => handleChange('freelancer_title', e.target.value)}
                    placeholder="e.g., UI/UX Designer"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="freelancer_bio">Short Bio (1-2 lines)</Label>
              <Textarea
                id="freelancer_bio"
                value={formData.freelancer_bio}
                onChange={(e) => handleChange('freelancer_bio', e.target.value)}
                placeholder="A brief description of your expertise and experience..."
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-slate-500">
                {formData.freelancer_bio.length}/200 characters
              </p>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Branding'}
            </Button>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="mt-6 p-4 border rounded-lg bg-slate-50">
              <h3 className="font-medium mb-4">Client Page Preview</h3>
              <div 
                className="rounded-lg p-6 text-white"
                style={{ backgroundColor: formData.primary_color }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                    {formData.logo_url ? (
                      <img
                        src={formData.logo_url}
                        alt="Preview"
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">
                      {formData.freelancer_name || 'Your Name'}
                    </h4>
                    <p className="text-white/90">
                      {formData.freelancer_title || 'Your Title'}
                    </p>
                    <p className="text-sm text-white/80 mt-1">
                      {formData.freelancer_bio || 'Your bio will appear here...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
