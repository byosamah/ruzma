import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';
import { FreelancerBranding } from '@/types/branding';
import { 
  HelpCircle, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Clock,
  CheckCircle,
  Upload
} from 'lucide-react';

interface ModernInstructionsCardProps {
  branding?: FreelancerBranding | null;
  paymentProofRequired?: boolean;
}

const ModernInstructionsCard: React.FC<ModernInstructionsCardProps> = ({
  branding,
  paymentProofRequired = false,
}) => {
  const t = useT();

  const instructions = [
    {
      id: 'review-milestones',
      icon: FileText,
      title: 'Review Milestones',
      content: 'Review the project milestones and their requirements. Each milestone represents a deliverable with specific goals and payment amount.',
      badge: 'Step 1',
    },
    {
      id: 'track-progress',
      icon: Clock,
      title: 'Track Progress',
      content: 'Monitor the status of each milestone as work progresses. You\'ll be notified when deliverables are ready for review.',
      badge: 'Ongoing',
    },
    ...(paymentProofRequired ? [{
      id: 'payment-proof',
      icon: Upload,
      title: 'Upload Payment Proof',
      content: 'When a milestone is delivered, upload proof of payment (receipt, screenshot) to confirm payment has been made.',
      badge: 'Required',
    }] : []),
    {
      id: 'request-revisions',
      icon: MessageSquare,
      title: 'Request Revisions',
      content: 'If deliverables need changes, you can request revisions with specific feedback to guide improvements.',
      badge: 'Optional',
    },
    {
      id: 'final-approval',
      icon: CheckCircle,
      title: 'Final Approval',
      content: 'Once satisfied with the deliverable and payment is confirmed, the milestone will be marked as approved.',
      badge: 'Final',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          {t('howItWorks')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="review-milestones">
          {instructions.map((instruction) => (
            <AccordionItem key={instruction.id} value={instruction.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 rounded-lg bg-muted">
                    <instruction.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{instruction.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {instruction.badge}
                      </Badge>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2">
                <div className="pl-12">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {instruction.content}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact Information */}
        {branding && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Need Help?</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Contact {branding.freelancer_name || 'your freelancer'} if you have any questions about the project or need assistance.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModernInstructionsCard;