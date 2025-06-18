
import { DatabaseProject } from '@/hooks/projectTypes';
import { CurrencyCode } from '@/lib/currency';

export interface ProjectCardProps {
  project: DatabaseProject;
  onViewClick: (projectId: string) => void;
  onEditClick: (projectId: string) => void;
  onDeleteClick?: (projectId: string) => void;
  currency: CurrencyCode;
  isVerticalLayout?: boolean;
}

export interface ProjectStats {
  totalValue: number;
  completedMilestones: number;
  totalMilestones: number;
}
