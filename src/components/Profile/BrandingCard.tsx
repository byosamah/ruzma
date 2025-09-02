
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Icons replaced with emojis
import { FreelancerBranding, BrandingFormData } from '@/types/branding';
import { useT } from '@/lib/i18n';

interface BrandingCardProps {
  branding: FreelancerBranding | null;
  onSave: (data: BrandingFormData) => Promise<boolean>;
  onLogoUpload: (file: File) => Promise<string | null>;
  isSaving: boolean;
}

export function BrandingCard({
  branding,
  onSave,
  onLogoUpload,
  isSaving
}: BrandingCardProps) {
  const t = useT();
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<BrandingFormData>({
    freelancer_name: '',
    freelancer_title: '',
    freelancer_bio: '',
    primary_color: '#4B72E5',
    secondary_color: '#1D3770',
    logo_url: ''
  });

  // Update form data when branding changes
  useEffect(() => {
    if (branding) {
      setFormData({
        freelancer_name: branding.freelancer_name || '',
        freelancer_title: branding.freelancer_title || '',
        freelancer_bio: branding.freelancer_bio || '',
        primary_color: branding.primary_color || '#4B72E5',
        secondary_color: branding.secondary_color || '#1D3770',
        logo_url: branding.logo_url || ''
      });
    }
  }, [branding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">🎨</span>
          Advanced Branding
        </CardTitle>
        <p className="text-sm text-slate-600">
          Preview your client pages and manage advanced branding settings. Basic brand elements (logo, color, title, bio) are managed in Personal Information above.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
            >
              <span className="text-lg mr-2">👁️</span>
              {showPreview ? 'Hide Preview' : 'Show Client Page Preview'}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Update Branding'}
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
                        <span className="text-2xl text-slate-400">👤</span>
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
