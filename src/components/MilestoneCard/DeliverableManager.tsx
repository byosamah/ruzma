
import React from 'react';
import { Link } from 'lucide-react';
import { useT } from '@/lib/i18n';
import MultiLinkManager from './MultiLinkManager';

interface DeliverableManagerProps {
  milestone: {
    id: string;
    deliverable_link?: string;
    status: string;
  };
  onDeliverableLinkUpdate?: (milestoneId: string, link: string) => void;
}

const DeliverableManager: React.FC<DeliverableManagerProps> = ({
  milestone,
  onDeliverableLinkUpdate,
}) => {
  const t = useT();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Link className="w-4 h-4" />
          {t('deliverable')} - Shared Links
        </h4>
      </div>

      <MultiLinkManager
        milestone={milestone}
        onDeliverableLinkUpdate={onDeliverableLinkUpdate}
      />
    </div>
  );
};

export default DeliverableManager;
