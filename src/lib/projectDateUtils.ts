
// Re-export from consolidated formatters module
export { formatProjectDate } from '@/lib/formatters';

interface Milestone {
  start_date?: string;
  end_date?: string;
}

export const calculateProjectDates = (milestones: Milestone[]) => {
  const startDates = milestones
    .map(m => m.start_date)
    .filter(date => date && date.trim() !== '')
    .sort();

  const endDates = milestones
    .map(m => m.end_date)
    .filter(date => date && date.trim() !== '')
    .sort();

  return {
    start_date: startDates.length > 0 ? startDates[0] : null,
    end_date: endDates.length > 0 ? endDates[endDates.length - 1] : null,
  };
};
