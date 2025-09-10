import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useT } from '@/lib/i18n';

interface AIRecommendationsProps {
  title: string;
  recommendations: string[];
  isLoading: boolean;
  icon: React.ReactNode;
  color: string;
}

function AIRecommendations({ 
  title, 
  recommendations, 
  isLoading, 
  icon, 
  color 
}: AIRecommendationsProps) {
  const t = useT();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if any recommendation appears to be truncated
  const hasTruncatedContent = recommendations.some(rec => 
    rec.includes('---') || rec.includes('...') || rec.length < 50
  );
  
  // Process recommendations to handle truncation
  const processedRecommendations = recommendations.map(rec => {
    if (rec === '---' || rec.trim() === '') {
      return t('contentBeingGenerated');
    }
    return rec;
  }).filter(rec => rec.length > 10); // Filter out very short or empty content
  if (isLoading) {
    return (
      <Card className="border-0 shadow-none bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse mt-0.5"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Sparkles className="h-4 w-4" />
            <span>{t('aiAnalyzing')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (processedRecommendations.length === 0) {
    return (
      <Card className="border-0 shadow-none bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {t('aiRecommendationsWillAppear')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-gray-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            {t('aiPowered')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {processedRecommendations.slice(0, isExpanded ? processedRecommendations.length : 3).map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full ${color} text-white text-xs font-medium mt-0.5`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {recommendation}
                </p>
              </div>
            </div>
          ))}
          
          {processedRecommendations.length > 3 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    {t('showLess')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    {t('showMore')} ({processedRecommendations.length - 3} more)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle className="h-3 w-3" />
              <span>{t('recommendationsGenerated')}</span>
            </div>
            {hasTruncatedContent && (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <Sparkles className="h-3 w-3" />
                <span>{t('aiStillProcessing')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(AIRecommendations);