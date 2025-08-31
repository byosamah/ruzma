import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Mail } from 'lucide-react';

interface PendingContractNoticeProps {
  projectName: string;
  freelancerName: string;
}

function PendingContractNotice({
  projectName,
  freelancerName,
}: PendingContractNoticeProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-8 h-8 text-orange-500" />
            <Badge variant="outline" className="text-orange-600">
              Pending Approval
            </Badge>
          </div>
          <CardTitle className="text-2xl">Contract Awaiting Your Approval</CardTitle>
          <CardDescription className="text-lg">
            {freelancerName} has submitted a project proposal for your review
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{projectName}</h3>
            <p className="text-muted-foreground">
              Please check your email for the contract approval link. You'll need to review and approve 
              the project details before you can access this project page.
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800">Next Steps:</h4>
                <ul className="text-sm text-orange-700 mt-2 space-y-1">
                  <li>• Check your email inbox for the contract approval email</li>
                  <li>• Review the project details, milestones, and pricing</li>
                  <li>• Approve the contract or provide feedback for changes</li>
                  <li>• Once approved, you'll gain access to track project progress</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              If you haven't received the email, please check your spam folder or contact {freelancerName} directly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingContractNotice;