
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, ExternalLink, X, Plus } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { toast } from 'sonner';
import { DeliverableLink, parseDeliverableLinks, stringifyDeliverableLinks, validateDeliverableLink, normalizeDeliverableLink } from '@/lib/linkUtils';

interface MultiLinkManagerProps {
  milestone: {
    id: string;
    deliverable_link?: string;
  };
  onDeliverableLinkUpdate?: (milestoneId: string, link: string) => void;
}

const MultiLinkManager: React.FC<MultiLinkManagerProps> = ({
  milestone,
  onDeliverableLinkUpdate,
}) => {
  const t = useT();
  const [links, setLinks] = useState<DeliverableLink[]>(() => 
    parseDeliverableLinks(milestone.deliverable_link)
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync local state when milestone.deliverable_link changes
  useEffect(() => {
    setLinks(parseDeliverableLinks(milestone.deliverable_link));
  }, [milestone.deliverable_link]);

  const addNewLink = () => {
    if (links.length >= 3) {
      toast.error('Maximum 3 links allowed per milestone');
      return;
    }
    setLinks([...links, { url: '', title: '' }]);
  };

  const updateLink = (index: number, field: 'url' | 'title', value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLinks(updatedLinks);
  };

  const removeLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };

  const saveLinks = async () => {
    // Validate and normalize all URLs
    const processedLinks = [];
    for (const link of links) {
      if (!link.url.trim()) continue;
      
      if (!validateDeliverableLink(link.url)) {
        toast.error(`Invalid URL: ${link.url}`);
        return;
      }
      
      // Normalize the URL (add https:// if missing)
      processedLinks.push({
        ...link,
        url: normalizeDeliverableLink(link.url)
      });
    }

    setIsUpdating(true);
    try {
      if (onDeliverableLinkUpdate) {
        const linkString = stringifyDeliverableLinks(processedLinks);
        await onDeliverableLinkUpdate(milestone.id, linkString);
        setLinks(processedLinks);
        toast.success('Links updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update links');
    } finally {
      setIsUpdating(false);
    }
  };

  const removeAllLinks = async () => {
    setIsUpdating(true);
    try {
      if (onDeliverableLinkUpdate) {
        await onDeliverableLinkUpdate(milestone.id, '');
        setLinks([]);
        toast.success('All links removed successfully');
      }
    } catch (error) {
      toast.error('Failed to remove links');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Link className="w-4 h-4" />
          {t('sharedLinks')} ({links.length}/3)
        </h4>
        {links.length && (
          <Button
            variant="ghost"
            size="sm"
            onClick={removeAllLinks}
            disabled={isUpdating}
            className="text-red-600 hover:bg-red-50 text-xs"
          >
            {t('clearAll')}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-gray-600">
                {t('linkNumber', { number: (index + 1).toString() })}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLink(index)}
                className="text-red-600 hover:bg-red-100 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <Input
              placeholder={t('linkTitleOptional')}
              value={link.title}
              onChange={(e) => updateLink(index, 'title', e.target.value)}
              className="text-sm"
            />
            
            <div className="flex space-x-2">
              <Input
                placeholder="example.com or https://example.com"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                className="text-sm flex-1"
              />
              {link.url && validateDeliverableLink(link.url) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(link.url, '_blank')}
                  className="px-2"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {links.length < 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={addNewLink}
            className="w-full text-gray-600 border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addLink')} ({links.length}/3)
          </Button>
        )}
      </div>

      {links.length && (
        <div className="flex space-x-2">
          <Button
            onClick={saveLinks}
            disabled={isUpdating}
            size="sm"
            className="flex-1"
          >
            {isUpdating ? t('saving') : t('saveLinks')}
          </Button>
        </div>
      )}

      {!links.length && (
        <div className="text-center py-6 text-gray-500">
          <Link className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">{t('noLinksAddedYet')}</p>
          <p className="text-xs text-gray-400">{t('addUpToThreeLinks')}</p>
        </div>
      )}
    </div>
  );
};

export default MultiLinkManager;
