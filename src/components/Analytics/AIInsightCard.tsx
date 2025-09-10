import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, Users, DollarSign, AlertTriangle, Target } from "lucide-react";
import { useT } from '@/lib/i18n';

interface AIInsight {
  category: 'revenue' | 'efficiency' | 'clients' | 'growth' | 'risks';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  impact: string;
  confidence: number;
}

interface AIInsightCardProps {
  insight: AIInsight;
  onImplement?: () => void;
}

function AIInsightCard({ insight, onImplement }: AIInsightCardProps) {
  const t = useT();
  const getCategoryIcon = () => {
    switch (insight.category) {
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'efficiency': return <Target className="h-4 w-4" />;
      case 'clients': return <Users className="h-4 w-4" />;
      case 'growth': return <TrendingUp className="h-4 w-4" />;
      case 'risks': return <AlertTriangle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = () => {
    switch (insight.category) {
      case 'revenue': return 'bg-green-100 text-green-800 border-green-200';
      case 'efficiency': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'clients': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'growth': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'risks': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = () => {
    switch (insight.priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = () => {
    return insight.category.charAt(0).toUpperCase() + insight.category.slice(1);
  };

  return (
    <Card className="border-0 shadow-none bg-gray-50">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${getCategoryColor()}`}>
              {getCategoryIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-medium break-words">{insight.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={`${getCategoryColor()} text-xs`}>
                  {getCategoryLabel()}
                </Badge>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor()}`}></div>
                  <span className="text-xs text-gray-500 capitalize">{insight.priority}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right sm:text-right text-left flex-shrink-0">
            <div className="text-xs text-gray-500">{t('confidence')}</div>
            <div className="text-sm font-medium">{insight.confidence}%</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Analysis */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">📊 {t('analysis')}</h4>
          <p className="text-sm text-gray-600 break-words leading-relaxed">{insight.description}</p>
        </div>

        {/* Recommendation */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">💡 {t('recommendation')}</h4>
          <p className="text-sm text-gray-600 break-words leading-relaxed">{insight.recommendation}</p>
        </div>

        {/* Expected Impact */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">🎯 {t('expectedImpact')}</h4>
          <p className="text-sm text-gray-600 break-words leading-relaxed">{insight.impact}</p>
        </div>

      </CardContent>
    </Card>
  );
}

export default memo(AIInsightCard);