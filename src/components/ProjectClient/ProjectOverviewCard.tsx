
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, CurrencyCode } from "@/lib/currency";
import { useT } from "@/lib/i18n";

interface ProjectOverviewCardProps {
  projectName: string;
  projectBrief: string;
  totalValue: number;
  totalMilestones: number;
  completedMilestones: number;
  currency: CurrencyCode;
  freelancerCurrency?: CurrencyCode; // Add freelancer's preferred currency
}

const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({
  projectName,
  projectBrief,
  totalValue,
  totalMilestones,
  completedMilestones,
  currency,
  freelancerCurrency,
}) => {
  const t = useT();
  
  // Use freelancer's preferred currency if available, otherwise fall back to the provided currency
  const displayCurrency = freelancerCurrency || currency;
  
  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <CardTitle className="text-2xl text-slate-800">{projectName}</CardTitle>
            <p className="text-slate-600 mt-2">{projectBrief}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-800">{formatCurrency(totalValue, displayCurrency)}</div>
            <div className="text-sm text-slate-600">{t('totalProjectValue')}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalMilestones}</div>
            <div className="text-sm text-slate-600">{t('totalMilestones')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedMilestones}</div>
            <div className="text-sm text-slate-600">{t('completed')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">
              {totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%
            </div>
            <div className="text-sm text-slate-600">{t('progress')}</div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">{t('projectProgress')}</span>
            <span className="text-sm text-slate-600">{completedMilestones}/{totalMilestones} {t('milestones_plural')}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverviewCard;
