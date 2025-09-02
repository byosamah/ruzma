import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { 
  Calendar, 
  DollarSign, 
  Download, 
  Upload, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  FileText
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  price: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'payment_submitted' | 'approved' | 'rejected' | 'revision_requested';
  deliverable_link?: string;
  paymentProofUrl?: string;
  start_date?: string;
  end_date?: string;
}

interface ModernMilestoneCardProps {
  milestone: Milestone;
  currency: CurrencyCode;
  onPaymentUpload?: (milestoneId: string, file: File) => Promise<boolean>;
  onRevisionRequest?: (milestoneId: string, feedback: string, images: string[]) => Promise<void>;
  paymentProofRequired?: boolean;
  isClient?: boolean;
}

const ModernMilestoneCard = ({
  milestone,
  currency,
  onPaymentUpload,
  onRevisionRequest,
  paymentProofRequired = false,
  isClient = true,
}: ModernMilestoneCardProps) => {
  const t = useT();
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);

  const getStatusConfig = (status: Milestone['status']) => {
    switch (status) {
      case 'pending':
        return { 
          icon: Clock, 
          label: 'Pending', 
          variant: 'secondary' as const,
          progress: 0 
        };
      case 'in_progress':
        return { 
          icon: Clock, 
          label: 'In Progress', 
          variant: 'default' as const,
          progress: 25 
        };
      case 'delivered':
        return { 
          icon: CheckCircle, 
          label: 'Delivered', 
          variant: 'default' as const,
          progress: 75 
        };
      case 'payment_submitted':
        return { 
          icon: Upload, 
          label: 'Payment Submitted', 
          variant: 'default' as const,
          progress: 90 
        };
      case 'approved':
        return { 
          icon: CheckCircle, 
          label: 'Approved', 
          variant: 'default' as const,
          progress: 100 
        };
      case 'rejected':
        return { 
          icon: AlertCircle, 
          label: t('rejected'), 
          variant: 'destructive' as const,
          progress: 50 
        };
      case 'revision_requested':
        return { 
          icon: MessageSquare, 
          label: 'Revision Requested', 
          variant: 'outline' as const,
          progress: 60 
        };
      default:
        return { 
          icon: Clock, 
          label: status, 
          variant: 'secondary' as const,
          progress: 0 
        };
    }
  };

  const statusConfig = getStatusConfig(milestone.status);
  const StatusIcon = statusConfig.icon;

  const handlePaymentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onPaymentUpload) return;

    setIsUploadingPayment(true);
    try {
      await onPaymentUpload(milestone.id, file);
    } finally {
      setIsUploadingPayment(false);
    }
  };

  const handleRevisionSubmit = async () => {
    if (!onRevisionRequest || !revisionFeedback.trim()) return;
    
    await onRevisionRequest(milestone.id, revisionFeedback, []);
    setRevisionFeedback('');
  };

  const canRequestRevision = milestone.status === 'delivered';
  const canUploadPayment = milestone.status === 'delivered' && paymentProofRequired;
  const hasDeliverable = milestone.deliverable_link;

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {milestone.title}
            </h3>
            {milestone.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {milestone.description}
              </p>
            )}
          </div>
          <Badge variant={statusConfig.variant} className="flex items-center gap-1.5 shrink-0">
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={statusConfig.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{statusConfig.progress}% complete</span>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {formatCurrency(milestone.price, currency)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deliverable Section */}
        {hasDeliverable && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('deliverable')}</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={milestone.deliverable_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t('view')}
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Payment Upload Section */}
        {canUploadPayment && (
          <div className="p-4 border-2 border-dashed border-muted rounded-lg">
            <div className="text-center space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Upload Payment Proof</p>
                <p className="text-xs text-muted-foreground">Upload receipt or payment confirmation</p>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handlePaymentUpload}
                className="hidden"
                id={`payment-upload-${milestone.id}`}
                disabled={isUploadingPayment}
              />
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                disabled={isUploadingPayment}
              >
                <label htmlFor={`payment-upload-${milestone.id}`} className="cursor-pointer">
                  {isUploadingPayment ? 'Uploading...' : 'Select File'}
                </label>
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {canRequestRevision && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Request Revision
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Request Revision</AlertDialogTitle>
                  <AlertDialogDescription>
                    Provide specific feedback about what needs to be changed or improved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Please describe what needs to be revised..."
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    rows={4}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleRevisionSubmit}
                    disabled={!revisionFeedback.trim()}
                  >
                    Submit Request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {milestone.paymentProofUrl && (
            <Button variant="outline" size="sm" asChild>
              <a 
                href={milestone.paymentProofUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                View Payment Proof
              </a>
            </Button>
          )}
        </div>

        {/* Timeline */}
        {(milestone.start_date || milestone.end_date) && (
          <>
            <Separator />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {milestone.start_date && milestone.end_date ? (
                <span>
                  {new Date(milestone.start_date).toLocaleDateString()} - {new Date(milestone.end_date).toLocaleDateString()}
                </span>
              ) : milestone.start_date ? (
                <span>{t('starts')}: {new Date(milestone.start_date).toLocaleDateString()}</span>
              ) : (
                <span>{t('ends')}: {new Date(milestone.end_date!).toLocaleDateString()}</span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(ModernMilestoneCard);