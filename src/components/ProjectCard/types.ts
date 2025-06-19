
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
  isVerticalLayout: boolean;
}

export interface ProjectCardProps extends ProjectCardContentProps {
  onEdit?: (projectId: string) => void;
  onView?: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
  onDuplicate?: (projectId: string) => void;
  onShare?: (projectId: string) => void;
}
