
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n";

function ProjectFooter() {
  const t = useT();
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t('questionsContactFreelancer')}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {t('poweredByRuzma')}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProjectFooter;
