
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useT } from "@/lib/i18n";

const ProjectInstructionsCard: React.FC = () => {
  const t = useT();
  return (
  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
    <CardContent className="pt-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 mb-2">{t('howItWorks')}</h3>
          <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
            <li>{t('instruction1')}</li>
            <li>{t('instruction2')}</li>
            <li>{t('instruction3')}</li>
            <li>{t('instruction4')}</li>
          </ol>
        </div>
      </div>
    </CardContent>
  </Card>
)};

export default ProjectInstructionsCard;
