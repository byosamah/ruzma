
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

const ProjectFooter: React.FC = () => {
  const t = useT();
  return (
    <Card className="bg-slate-100 border-slate-200">
      <CardContent className="pt-6 text-center">
        <p className="text-sm text-slate-600">
          {t('questionsContactFreelancer')}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          {t('poweredByRuzma')}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProjectFooter;
