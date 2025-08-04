import { useMemo } from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { ProjectTypeAnalytics, ProfitabilityData, ProfitabilityMetric } from '@/types/advancedAnalytics';

// Bilingual project categorization based on keywords in project name/brief
const categorizeProject = (project: DatabaseProject): string => {
  const text = `${project.name} ${project.brief}`.toLowerCase();
  
  // English keywords
  if (text.includes('website') || text.includes('web') || text.includes('landing') || 
      text.includes('موقع') || text.includes('ويب') || text.includes('صفحة')) return 'webDevelopment';
  if (text.includes('app') || text.includes('mobile') || text.includes('ios') || text.includes('android') ||
      text.includes('تطبيق') || text.includes('محمول') || text.includes('جوال')) return 'mobileApp';
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('logo') || text.includes('brand') ||
      text.includes('تصميم') || text.includes('شعار') || text.includes('هوية') || text.includes('علامة')) return 'designBranding';
  if (text.includes('marketing') || text.includes('seo') || text.includes('social') || text.includes('content') ||
      text.includes('تسويق') || text.includes('محتوى') || text.includes('إعلان')) return 'marketing';
  if (text.includes('data') || text.includes('analytics') || text.includes('dashboard') || text.includes('report') ||
      text.includes('بيانات') || text.includes('تحليل') || text.includes('تقرير') || text.includes('لوحة')) return 'dataAnalytics';
  if (text.includes('ecommerce') || text.includes('shop') || text.includes('store') || text.includes('e-commerce') ||
      text.includes('متجر') || text.includes('تجارة') || text.includes('بيع')) return 'ecommerce';
  if (text.includes('api') || text.includes('backend') || text.includes('database') || text.includes('server') ||
      text.includes('خادم') || text.includes('قاعدة') || text.includes('بيانات')) return 'backendDevelopment';
  if (text.includes('consult') || text.includes('strategy') || text.includes('advice') ||
      text.includes('استشار') || text.includes('نصيحة') || text.includes('إرشاد')) return 'consulting';
  
  return 'other';
};

// Bilingual metric translations
const getMetricName = (key: string, locale: string = 'en'): string => {
  const translations: { [key: string]: { en: string; ar: string } } = {
    'Monthly Revenue Growth': { 
      en: 'Monthly Revenue Growth', 
      ar: 'نمو الإيرادات الشهرية' 
    },
    'Average Project Margin': { 
      en: 'Average Project Margin', 
      ar: 'متوسط هامش المشروع' 
    },
    'Month over Month': { 
      en: 'Month over Month', 
      ar: 'مقارنة بالشهر السابق' 
    },
    'Current Period': { 
      en: 'Current Period', 
      ar: 'الفترة الحالية' 
    },
    'up': { 
      en: 'up', 
      ar: 'صاعد' 
    },
    'down': { 
      en: 'down', 
      ar: 'هابط' 
    },
    'stable': { 
      en: 'stable', 
      ar: 'مستقر' 
    },
    // Object keys for revenueOptimization
    'currentAvgRate': {
      en: 'currentAvgRate',
      ar: 'المعدل_المتوسط_الحالي'
    },
    'suggestedRate': {
      en: 'suggestedRate',
      ar: 'المعدل_المقترح'
    },
    'potentialIncrease': {
      en: 'potentialIncrease',
      ar: 'الزيادة_المحتملة'
    },
    // Object keys for projectTypes
    'category': {
      en: 'category',
      ar: 'الفئة'
    },
    'projectCount': {
      en: 'projectCount',
      ar: 'عدد_المشاريع'
    },
    'avgRevenue': {
      en: 'avgRevenue',
      ar: 'متوسط_الإيرادات'
    },
    'totalRevenue': {
      en: 'totalRevenue',
      ar: 'إجمالي_الإيرادات'
    },
    'avgDuration': {
      en: 'avgDuration',
      ar: 'متوسط_المدة'
    },
    'revenuePerDay': {
      en: 'revenuePerDay',
      ar: 'الإيرادات_لكل_يوم'
    },
    'completionRate': {
      en: 'completionRate',
      ar: 'معدل_الإنجاز'
    },
    'clientSatisfactionProxy': {
      en: 'clientSatisfactionProxy',
      ar: 'مؤشر_رضا_العملاء'
    },
    'marketDemand': {
      en: 'marketDemand',
      ar: 'طلب_السوق'
    },
    // Object keys for pricingTrends
    'month': {
      en: 'month',
      ar: 'الشهر'
    },
    'avgPrice': {
      en: 'avgPrice',
      ar: 'متوسط_السعر'
    },
    // Main return object keys
    'projectTypes': {
      en: 'projectTypes',
      ar: 'أنواع_المشاريع'
    },
    'pricingTrends': {
      en: 'pricingTrends',
      ar: 'اتجاهات_التسعير'
    },
    'profitabilityMetrics': {
      en: 'profitabilityMetrics',
      ar: 'مقاييس_الربحية'
    },
    'revenueOptimization': {
      en: 'revenueOptimization',
      ar: 'تحسين_الإيرادات'
    },
    // Metric and period keys
    'metric': {
      en: 'metric',
      ar: 'المقياس'
    },
    'value': {
      en: 'value',
      ar: 'القيمة'
    },
    'trend': {
      en: 'trend',
      ar: 'الاتجاه'
    },
    'period': {
      en: 'period',
      ar: 'الفترة'
    }
  };
  
  return translations[key]?.[locale] || key;
};

export const useProfitabilityAnalytics = (projects: DatabaseProject[], locale: string = 'en') => {
  const profitabilityData = useMemo((): ProfitabilityData => {
    // Group projects by type
    const projectsByType = new Map<string, DatabaseProject[]>();
    
    projects.forEach(project => {
      const category = categorizeProject(project);
      const categoryProjects = projectsByType.get(category) || [];
      categoryProjects.push(project);
      projectsByType.set(category, categoryProjects);
    });

    // Calculate analytics for each project type
    const projectTypes: ProjectTypeAnalytics[] = Array.from(projectsByType.entries()).map(([category, categoryProjects]) => {
      const totalRevenue = categoryProjects.reduce((sum, project) => 
        sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0
      );
      
      const avgRevenue = totalRevenue / categoryProjects.length;
      
      // Calculate average duration
      const projectsWithDates = categoryProjects.filter(p => p.start_date && p.end_date);
      const avgDuration = projectsWithDates.length > 0 
        ? projectsWithDates.reduce((sum, project) => {
            const duration = Math.ceil((new Date(project.end_date!).getTime() - new Date(project.start_date!).getTime()) / (1000 * 60 * 60 * 24));
            return sum + Math.max(1, duration);
          }, 0) / projectsWithDates.length
        : 30; // default 30 days if no dates
      
      const revenuePerDay = avgRevenue / avgDuration;
      
      // Calculate completion rate
      const totalMilestones = categoryProjects.reduce((sum, project) => sum + project.milestones.length, 0);
      const completedMilestones = categoryProjects.reduce((sum, project) => 
        sum + project.milestones.filter(m => m.status === 'approved').length, 0
      );
      const completionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
      
      // Calculate client satisfaction proxy (repeat business rate)
      const clientEmails = new Set(categoryProjects.map(p => p.client_email).filter(Boolean));
      const repeatClients = Array.from(clientEmails).filter(email => 
        categoryProjects.filter(p => p.client_email === email).length > 1
      );
      const clientSatisfactionProxy = clientEmails.size > 0 ? (repeatClients.length / clientEmails.size) * 100 : 0;
      
      // Market demand is simply the frequency of this project type
      const marketDemand = (categoryProjects.length / projects.length) * 100;
      
      return {
        category,
        projectCount: categoryProjects.length,
        avgRevenue,
        totalRevenue,
        avgDuration,
        revenuePerDay,
        completionRate,
        clientSatisfactionProxy,
        marketDemand,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Generate pricing trends (last 6 months)
    const pricingTrends = Array.from({length: 6}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthStr = date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', year: 'numeric' });
      
      const monthProjects = projects.filter(project => {
        const projectDate = new Date(project.created_at);
        return projectDate.getMonth() === date.getMonth() && projectDate.getFullYear() === date.getFullYear();
      });
      
      const avgPrice = monthProjects.length > 0 
        ? monthProjects.reduce((sum, project) => 
            sum + project.milestones.reduce((mSum, m) => mSum + m.price, 0), 0
          ) / monthProjects.length
        : 0;
      
      return {
        month: monthStr,
        avgPrice,
        projectCount: monthProjects.length,
      };
    });

    // Calculate profitability metrics
    const currentMonthRevenue = projects
      .filter(p => new Date(p.created_at).getMonth() === new Date().getMonth())
      .reduce((sum, project) => 
        sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0
      );
    
    const lastMonthRevenue = projects
      .filter(p => {
        const date = new Date(p.created_at);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, project) => 
        sum + project.milestones.filter(m => m.status === 'approved').reduce((mSum, m) => mSum + m.price, 0), 0
      );

    const profitabilityMetrics: ProfitabilityMetric[] = [
      {
        metric: getMetricName('Monthly Revenue Growth', locale),
        value: lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
        trend: currentMonthRevenue > lastMonthRevenue ? getMetricName('up', locale) : currentMonthRevenue < lastMonthRevenue ? getMetricName('down', locale) : getMetricName('stable', locale),
        period: getMetricName('Month over Month', locale),
      },
      {
        metric: getMetricName('Average Project Margin', locale),
        value: projectTypes.length > 0 ? projectTypes.reduce((sum, pt) => sum + pt.completionRate, 0) / projectTypes.length : 0,
        trend: getMetricName('stable', locale),
        period: getMetricName('Current Period', locale),
      },
    ];

    // Revenue optimization suggestions
    const currentAvgRate = projects.length > 0 
      ? projects.reduce((sum, project) => 
          sum + project.milestones.reduce((mSum, m) => mSum + m.price, 0), 0
        ) / projects.length
      : 0;
    
    const topPerformingRate = projectTypes.length > 0 
      ? Math.max(...projectTypes.map(pt => pt.revenuePerDay)) * 30 // convert to monthly
      : currentAvgRate;
    
    const suggestedRate = Math.min(currentAvgRate * 1.15, topPerformingRate); // 15% increase or top rate
    const potentialIncrease = ((suggestedRate - currentAvgRate) / currentAvgRate) * 100;

    const revenueOptimization = {
      currentAvgRate,
      suggestedRate,
      potentialIncrease: Math.max(0, potentialIncrease),
    };

    return {
      projectTypes,
      pricingTrends,
      profitabilityMetrics,
      revenueOptimization,
    };
  }, [projects, locale]);

  return profitabilityData;
};