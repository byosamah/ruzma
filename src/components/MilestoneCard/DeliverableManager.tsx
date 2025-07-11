
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, Download, FileUp } from 'lucide-react';
import { useT } from '@/lib/i18n';
import MultiLinkManager from './MultiLinkManager';

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
  const isUploadEnabled = userType === 'plus' || userType === 'pro';

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onDeliverableUpload) {
      onDeliverableUpload(milestone.id, file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">{t('deliverable')}</h4>
        {userType === 'free' && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
            {t('uploadRequiresPlusPro')}
          </span>
        )}
      </div>

      <Tabs defaultValue={isUploadEnabled ? "upload" : "link"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-50 h-9">
          <TabsTrigger 
            value="upload" 
            disabled={!isUploadEnabled}
            className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-none"
          >
            <Upload className="w-3 h-3 mr-1.5" />
            {t('upload')}
          </TabsTrigger>
          <TabsTrigger 
            value="link"
            className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-none"
          >
            <Link className="w-3 h-3 mr-1.5" />
            Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3 mt-4">
          {!isUploadEnabled ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100">
              <Upload className="w-6 h-6 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 mb-3">File upload is available for Plus and Pro plans</p>
              <Button size="sm" variant="outline" className="text-gray-600">
                Upgrade Plan
              </Button>
            </div>
          ) : (
            <>
              {milestone.deliverable ? (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Download className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{milestone.deliverable.name}</span>
                    <span className="text-xs text-gray-400">
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
                      <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                        <span className="cursor-pointer flex items-center">
                          <FileUp className="w-3 h-3 mr-1" />
                          {t('replace')}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id={`deliverable-upload-${milestone.id}`}
                    accept=".pdf,.zip,.rar,.docx,.pptx,.jpg,.png,.gif"
                  />
                  <label htmlFor={`deliverable-upload-${milestone.id}`}>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-1">Choose file to upload</p>
                      <p className="text-xs text-gray-400">PDF, ZIP, Images, etc.</p>
                    </div>
                  </label>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="link" className="space-y-3 mt-4">
          <MultiLinkManager
            milestone={milestone}
            onDeliverableLinkUpdate={onDeliverableLinkUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliverableManager;
