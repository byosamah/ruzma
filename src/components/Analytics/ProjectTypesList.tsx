import { memo } from "react";
import { useT } from '@/lib/i18n';

interface ProjectType {
  label: string;
  value: number;
  emoji?: string;
}

interface ProjectTypesListProps {
  data: ProjectType[];
}

function ProjectTypesList({ data }: ProjectTypesListProps) {
  const t = useT();
  // Get emoji for project type
  const getProjectTypeEmoji = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('web') || lowerLabel.includes('website')) return '🌐';
    if (lowerLabel.includes('design') || lowerLabel.includes('ui') || lowerLabel.includes('ux')) return '🎨';
    if (lowerLabel.includes('mobile') || lowerLabel.includes('app')) return '📱';
    if (lowerLabel.includes('branding') || lowerLabel.includes('logo')) return '🎯';
    if (lowerLabel.includes('marketing') || lowerLabel.includes('seo')) return '📊';
    if (lowerLabel.includes('content') || lowerLabel.includes('writing')) return '✍️';
    if (lowerLabel.includes('ecommerce') || lowerLabel.includes('shop')) return '🛒';
    if (lowerLabel.includes('consultation') || lowerLabel.includes('strategy')) return '💡';
    return '🔧'; // Default for "Other" or unknown types
  };

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Sort by value descending
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  if (total === 0 || sortedData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🎨</div>
        <p className="text-sm text-gray-500">
          {t('noProjectTypesToDisplay')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedData.map((item, index) => {
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const emoji = item.emoji || getProjectTypeEmoji(item.label);
        
        return (
          <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="text-xl flex-shrink-0">{emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 break-words">{item.label}</div>
                <div className="text-xs text-gray-500">
                  {item.value} {item.value === 1 ? t('project') : t('projects')}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-lg font-semibold text-gray-900">{percentage}%</div>
              <div className="w-12 sm:w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{t('totalProjects')}</span>
          <span className="font-medium text-gray-900">{total}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">{t('serviceCategories')}</span>
          <span className="font-medium text-gray-900">{sortedData.length}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ProjectTypesList);