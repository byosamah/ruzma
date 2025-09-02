import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';
import { 
  HelpCircle, 
  FileText, 
  Upload, 
  MessageSquare, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface ModernInstructionsCardProps {
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
}

const ModernInstructionsCard = ({
  branding,
  paymentProofRequired = false,
}) => {
  const t = useT();

  const steps = [
    {
      icon: FileText,
      title: 'Review Milestones',
      description: 'Check each milestone and its deliverables',
    },
    ...(paymentProofRequired ? [{
      icon: Upload,
      title: 'Upload Payment Proof',
      description: 'Submit payment confirmation when requested',
    }] : []),
    {
      icon: MessageSquare,
      title: 'Request Changes',
      description: 'Ask for revisions if needed',
    },
    {
      icon: CheckCircle,
      title: 'Approve Work',
      description: 'Final approval when satisfied',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HelpCircle className="w-5 h-5 text-primary" />
          How It Works
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Simple Steps Flow */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 sm:items-start">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-3 sm:flex-col sm:text-center flex-1">
                <div className="p-3 rounded-lg bg-muted shrink-0">
                  <step.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="sm:text-center">
                  <h3 className="font-medium text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block shrink-0 mt-3" />
              )}
            </div>
          ))}
        </div>

        {/* Simple Contact Info */}
        {branding && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Need help?</span>
              <span className="text-muted-foreground">
                Contact {branding.freelancer_name || 'your freelancer'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModernInstructionsCard;