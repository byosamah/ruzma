
import { DatabaseProject } from '@/hooks/projectTypes';
import { CurrencyCode } from '@/lib/currency';

export interface ProjectStats {
  totalMilestones: number;
  completedMilestones: number;
  totalValue: number;
  approvedValue: number;
}

export interface ProjectCardContentProps {
  project: DatabaseProject;
  stats: ProjectStats;
  currency: CurrencyCode;
  convertFrom?: CurrencyCode;
  isVerticalLayout: boolean;
}

export interface ProjectCardProps {
  project: DatabaseProject;
  onViewClick: (projectId: string) => void;
  onEditClick: (projectId: string) => void;
  onDeleteClick?: (projectId: string) => void;
  currency: CurrencyCode;
  convertFrom?: CurrencyCode;
  isVerticalLayout?: boolean;
}
