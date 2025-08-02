// Data formatting and transformation utilities

export const parseRevisionData = (revisionDataStr: string | null): any[] => {
  if (!revisionDataStr) return [];
  
  try {
    return JSON.parse(revisionDataStr);
  } catch (error) {
    console.warn('Failed to parse revision data:', error);
    return [];
  }
};

export const formatRevisionData = (revisionData: any[]): string => {
  try {
    return JSON.stringify(revisionData);
  } catch (error) {
    console.warn('Failed to format revision data:', error);
    return '[]';
  }
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Re-export from formatting utils to avoid duplication
export { formatFileSize } from '@/lib/utils/formatting';

// Re-export from formatting utils to avoid duplication
export { truncate as truncateText } from '@/lib/utils/formatting';

// Re-export from formatting utils to avoid duplication
export { capitalize as capitalizeFirst } from '@/lib/utils/formatting';

// Re-export from formatting utils to avoid duplication
export { formatPhoneNumber } from '@/lib/utils/formatting';

// Re-export from formatting utils to avoid duplication
export { stripHtml } from '@/lib/utils/formatting';

// Re-export from formatting utils to avoid duplication
export { formatNumber } from '@/lib/utils/formatting';