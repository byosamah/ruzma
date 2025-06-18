
import { format, isValid, parseISO } from 'date-fns';
import { DatabaseProject } from '@/hooks/projectTypes';
import { ProjectStats } from './types';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-500';
    case 'payment_submitted':
      return 'bg-yellow-500';
    case 'rejected':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const calculateProjectStats = (project: DatabaseProject): ProjectStats => {
  const totalValue = project.milestones.reduce((sum, milestone) => sum + milestone.price, 0);
  const completedMilestones = project.milestones.filter(m => m.status === 'approved').length;
  const totalMilestones = project.milestones.length;
  
  return { totalValue, completedMilestones, totalMilestones };
};

export const formatProjectDate = (dateString: string): string => {
  if (!dateString) return 'No Date';
  try {
    let date = new Date(dateString);
    if (isValid(date)) {
      return format(date, 'MMM d, yyyy');
    }

    date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'MMM d, yyyy');
    }
    return 'Invalid Date';
  } catch (error) {
    console.error('Date formatting error:', error, 'for date:', dateString);
    return 'Invalid Date';
  }
};
