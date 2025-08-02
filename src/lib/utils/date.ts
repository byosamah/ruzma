import { 
  addDays, 
  addMonths, 
  addYears,
  differenceInDays,
  differenceInMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isBefore,
  isAfter,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  parseISO,
  isValid
} from 'date-fns';

/**
 * Parse date safely
 */
export const parseDate = (date: string | Date | null | undefined): Date | null => {
  if (!date) return null;
  
  if (date instanceof Date) {
    return isValid(date) ? date : null;
  }
  
  try {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Date range helpers
 */
export const getDateRange = (rangeType: string): { start: Date; end: Date } => {
  const now = new Date();
  
  switch (rangeType) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    case 'thisWeek':
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case 'lastWeek':
      const lastWeek = subDays(now, 7);
      return { start: startOfWeek(lastWeek), end: endOfWeek(lastWeek) };
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'lastMonth':
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    case 'thisYear':
      return { start: startOfYear(now), end: endOfYear(now) };
    case 'lastYear':
      const lastYear = subMonths(now, 12);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
    case 'last7Days':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case 'last30Days':
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    case 'last90Days':
      return { start: startOfDay(subDays(now, 89)), end: endOfDay(now) };
    case 'last365Days':
      return { start: startOfDay(subDays(now, 364)), end: endOfDay(now) };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
};

/**
 * Check if date is in range
 */
export const isDateInRange = (
  date: Date | string,
  start: Date | string,
  end: Date | string
): boolean => {
  const parsedDate = parseDate(date);
  const parsedStart = parseDate(start);
  const parsedEnd = parseDate(end);
  
  if (!parsedDate || !parsedStart || !parsedEnd) return false;
  
  return isWithinInterval(parsedDate, { start: parsedStart, end: parsedEnd });
};

/**
 * Calculate days until deadline
 */
export const getDaysUntilDeadline = (deadline: Date | string): number => {
  const parsedDeadline = parseDate(deadline);
  if (!parsedDeadline) return 0;
  
  return differenceInDays(parsedDeadline, new Date());
};

/**
 * Check if deadline is approaching (within 3 days)
 */
export const isDeadlineApproaching = (
  deadline: Date | string,
  thresholdDays: number = 3
): boolean => {
  const daysUntil = getDaysUntilDeadline(deadline);
  return daysUntil >= 0 && daysUntil <= thresholdDays;
};

/**
 * Check if deadline has passed
 */
export const isOverdue = (deadline: Date | string): boolean => {
  const parsedDeadline = parseDate(deadline);
  if (!parsedDeadline) return false;
  
  return isBefore(parsedDeadline, new Date());
};

/**
 * Get business days between dates (excluding weekends)
 */
export const getBusinessDays = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) return 0;
  
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

/**
 * Add business days to date
 */
export const addBusinessDays = (
  date: Date | string,
  days: number
): Date => {
  const startDate = parseDate(date) || new Date();
  let current = new Date(startDate);
  let remainingDays = Math.abs(days);
  const direction = days >= 0 ? 1 : -1;
  
  while (remainingDays > 0) {
    current = addDays(current, direction);
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remainingDays--;
    }
  }
  
  return current;
};

/**
 * Get month range for analytics
 */
export const getMonthRange = (monthsBack: number = 6): Date[] => {
  const dates: Date[] = [];
  const now = new Date();
  
  for (let i = monthsBack - 1; i >= 0; i--) {
    dates.push(startOfMonth(subMonths(now, i)));
  }
  
  return dates;
};

/**
 * Check if two dates are in the same period
 */
export const isSamePeriod = (
  date1: Date | string,
  date2: Date | string,
  period: 'day' | 'week' | 'month' | 'year'
): boolean => {
  const parsed1 = parseDate(date1);
  const parsed2 = parseDate(date2);
  
  if (!parsed1 || !parsed2) return false;
  
  switch (period) {
    case 'day':
      return isSameDay(parsed1, parsed2);
    case 'week':
      return startOfWeek(parsed1).getTime() === startOfWeek(parsed2).getTime();
    case 'month':
      return startOfMonth(parsed1).getTime() === startOfMonth(parsed2).getTime();
    case 'year':
      return startOfYear(parsed1).getTime() === startOfYear(parsed2).getTime();
    default:
      return false;
  }
};

/**
 * Get age from date
 */
export const getAge = (birthDate: Date | string): number => {
  const birth = parseDate(birthDate);
  if (!birth) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format duration between dates
 */
export const getDuration = (
  startDate: Date | string,
  endDate: Date | string
): { months: number; days: number } => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) return { months: 0, days: 0 };
  
  const months = differenceInMonths(end, start);
  const remainingDays = differenceInDays(end, addMonths(start, months));
  
  return { months, days: remainingDays };
};