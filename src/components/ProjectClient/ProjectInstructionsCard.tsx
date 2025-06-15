
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const ProjectInstructionsCard: React.FC = () => (
  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
    <CardContent className="pt-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 mb-2">How it works:</h3>
          <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
            <li>Review each milestone below with its description and price</li>
            <li>Upload proof of payment (screenshot, receipt, or transaction ID) for each milestone</li>
            <li>Once payment is verified, you'll be able to download the deliverable</li>
            <li>Milestones must be completed in order</li>
          </ol>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProjectInstructionsCard;
