
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, ExternalLink, Download, FileUp } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { toast } from 'sonner';

interface DeliverableManagerProps {
  milestone: {
    id: string;
    deliverable?: {
      name: string;
      size: number;
      url?: string;
    };
    deliverable_link?: string;
    status: string;
  };
  userType: 'free' | 'plus' | 'pro';
  onDeliverableUpload?: (milestoneId: string, file: File) => void;
  onDeliverableLinkUpdate?: (milestoneId: string, link: string) => void;
}

const DeliverableManager: React.FC<DeliverableManagerProps> = ({
  milestone,
  userType,
  onDeliverableUpload,
  onDeliverableLinkUpdate,
}) => {
  const t = useT();
  const [deliverableLink, setDeliverableLink] = useState(milestone.deliverable_link || '');
  const [isUpdatingLink, setIsUpdatingLink] = useState(false);

  const isUploadEnabled = userType === 'plus' || userType === 'pro';

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onDeliverableUpload) {
      onDeliverableUpload(milestone.id, file);
    }
  };

  const handleLinkUpdate = async () => {
    if (!deliverableLink.trim()) {
      toast.error('Please enter a valid link');
      return;
    }

    try {
      new URL(deliverableLink);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsUpdatingLink(true);
    try {
      if (onDeliverableLinkUpdate) {
        await onDeliverableLinkUpdate(milestone.id, deliverableLink);
        toast.success('Deliverable link updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update deliverable link');
    } finally {
      setIsUpdatingLink(false);
    }
  };

  const handleLinkRemove = async () => {
    setIsUpdatingLink(true);
    try {
      if (onDeliverableLinkUpdate) {
        await onDeliverableLinkUpdate(milestone.id, '');
        setDeliverableLink('');
        toast.success('Deliverable link removed successfully');
      }
    } catch (error) {
      toast.error('Failed to remove deliverable link');
    } finally {
      setIsUpdatingLink(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Deliverable</h4>
        {userType === 'free' && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Upload: Upgrade to Plus/Pro
          </span>
        )}
      </div>

      <Tabs defaultValue={isUploadEnabled ? "upload" : "link"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" disabled={!isUploadEnabled}>
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="link">
            <Link className="w-4 h-4 mr-2" />
            Share Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          {!isUploadEnabled ? (
            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <Upload className="w-8 h-8 mx-auto mb-2 text-amber-600" />
              <p className="text-sm text-amber-800 mb-2">File upload is available for Plus and Pro plans</p>
              <Button size="sm" variant="outline" className="text-amber-700 border-amber-300">
                Upgrade Plan
              </Button>
            </div>
          ) : (
            <>
              {milestone.deliverable ? (
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Download className="w-4 h-4" />
                    <span>{milestone.deliverable.name}</span>
                    <span className="text-xs text-slate-400">
                      ({(milestone.deliverable.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id={`deliverable-replace-${milestone.id}`}
                      accept=".pdf,.zip,.rar,.docx,.pptx,.jpg,.png,.gif"
                    />
                    <label htmlFor={`deliverable-replace-${milestone.id}`}>
                      <Button asChild size="sm" variant="outline">
                        <span className="cursor-pointer flex items-center">
                          <FileUp className="w-4 h-4 mr-1" />
                          Replace
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor={`deliverable-upload-${milestone.id}`}>
                    Upload File (PDF, ZIP, Images, etc.)
                  </Label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id={`deliverable-upload-${milestone.id}`}
                    accept=".pdf,.zip,.rar,.docx,.pptx,.jpg,.png,.gif"
                  />
                  <label htmlFor={`deliverable-upload-${milestone.id}`}>
                    <Button asChild size="sm" className="w-full">
                      <span className="cursor-pointer flex items-center justify-center">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File to Upload
                      </span>
                    </Button>
                  </label>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="link" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`deliverable-link-${milestone.id}`}>
              Deliverable Link (Google Drive, Dropbox, etc.)
            </Label>
            <div className="flex space-x-2">
              <Input
                id={`deliverable-link-${milestone.id}`}
                type="url"
                placeholder="https://drive.google.com/..."
                value={deliverableLink}
                onChange={(e) => setDeliverableLink(e.target.value)}
              />
              <Button 
                onClick={handleLinkUpdate}
                disabled={isUpdatingLink}
                size="sm"
              >
                {isUpdatingLink ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          
          {milestone.deliverable_link && (
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <Link className="w-4 h-4" />
                <span>Link shared with client</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(milestone.deliverable_link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLinkRemove}
                  disabled={isUpdatingLink}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliverableManager;
