import { format, parseISO, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatDateWithTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM dd, yyyy • h:mm a');
  } catch {
    return 'Invalid date';
  }
};

export const calculateDuration = (startDate: string, endDate: string): string => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    const days = differenceInDays(end, start);
    const weeks = differenceInWeeks(end, start);
    const months = differenceInMonths(end, start);
    
    if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else if (weeks > 0) {
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  } catch {
    return 'Unknown duration';
  }
};

export const isOverdue = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return date < new Date();
  } catch {
    return false;
  }
};

export const getDaysUntilDeadline = (dateString: string): number => {
  try {
    const date = parseISO(dateString);
    return differenceInDays(date, new Date());
  } catch {
    return 0;
  }
};