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
const DeliverableManager = ({
  milestone,
  onDeliverableLinkUpdate
}) => {
  const t = useT();
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        
      </div>

      <MultiLinkManager milestone={milestone} onDeliverableLinkUpdate={onDeliverableLinkUpdate} />
    </div>;
};
export default DeliverableManager;