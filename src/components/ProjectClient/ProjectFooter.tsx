
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const ProjectFooter: React.FC = () => (
  <Card className="bg-slate-100 border-slate-200">
    <CardContent className="pt-6 text-center">
      <p className="text-sm text-slate-600">
        Questions about this project? Contact your freelancer directly.
      </p>
      <p className="text-xs text-slate-500 mt-2">
        Powered by Ruzma - Professional Freelance Project Management
      </p>
    </CardContent>
  </Card>
);

export default ProjectFooter;
