
import { useMemo } from 'react';
import { DatabaseProject } from './projectTypes';
import { useT } from '@/lib/i18n';

interface UpcomingDeadline {
  projectId: string;
  projectName: string;
  endDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  urgencyLevel: 'high' | 'medium' | 'low';
}

export const useUpcomingDeadlines = (projects: DatabaseProject[]) => {
  const t = useT();

  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlines: UpcomingDeadline[] = projects
      .filter(project => project.end_date)
      .map(project => {
        const endDate = new Date(project.end_date!);
        endDate.setHours(0, 0, 0, 0);
        
        const timeDiff = endDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const isOverdue = daysRemaining < 0;
        
        let urgencyLevel: 'high' | 'medium' | 'low' = 'low';
        if (isOverdue || daysRemaining <= 2) {
          urgencyLevel = 'high';
        } else if (daysRemaining <= 7) {
          urgencyLevel = 'medium';
        }

        return {
          projectId: project.id,
          projectName: project.name,
          endDate: project.end_date!,
          daysRemaining,
          isOverdue,
          urgencyLevel,
        };
      })
      .sort((a, b) => {
        // Sort overdue first, then by days remaining (ascending)
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.daysRemaining - b.daysRemaining;
      });

    return deadlines;
  }, [projects]);

  const stats = useMemo(() => {
    const overdue = upcomingDeadlines.filter(d => d.isOverdue).length;
    const dueSoon = upcomingDeadlines.filter(d => !d.isOverdue && d.daysRemaining <= 7).length;
    const nextDeadline = upcomingDeadlines.find(d => !d.isOverdue);
    
    return {
      overdue,
      dueSoon,
      nextDeadline,
      total: upcomingDeadlines.length,
    };
  }, [upcomingDeadlines]);

  return {
    upcomingDeadlines,
    stats,
  };
};
