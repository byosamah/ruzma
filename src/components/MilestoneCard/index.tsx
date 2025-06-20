
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MilestoneHeader from './MilestoneHeader';
import ClientView from './ClientView';
import FreelancerView from './FreelancerView';
import { Milestone } from './types';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { FreelancerBranding } from '@/types/branding';

interface MilestoneCardProps {
  milestone: Milestone;
  isClient?: boolean;
  onApprove?: (milestoneId: string) => void;
  onReject?: (milestoneId: string) => void;
  onPaymentUpload?: (milestoneId: string, file: File) => void;
  onDeliverableDownload?: (milestoneId: string) => void;
  onDeliverableUpload?: (milestoneId: string, file: File) => void;
  onWatermarkUpdate?: (milestoneId: string, watermark: string) => void;
  currency?: CurrencyCode;
  freelancerCurrency?: CurrencyCode;
  branding?: FreelancerBranding | null;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  isClient = false,
  onApprove,
  onReject,
  onPaymentUpload,
  onDeliverableDownload,
  onDeliverableUpload,
  onWatermarkUpdate,
  currency = 'USD',
  freelancerCurrency,
  branding,
}) => {
  const displayCurrency = freelancerCurrency || currency;
  const primaryColor = branding?.primary_color || '#4B72E5';
  
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
      <div 
        className="h-1 w-full"
        style={{ backgroundColor: primaryColor }}
      ></div>
      <CardContent className="p-6">
        <MilestoneHeader 
          milestone={milestone} 
          currency={displayCurrency} 
          branding={branding}
        />
        
        {isClient ? (
          <ClientView
            milestone={milestone}
            onPaymentUpload={onPaymentUpload}
            onDeliverableDownload={onDeliverableDownload}
          />
        ) : (
          <FreelancerView
            milestone={milestone}
            onApprove={onApprove}
            onReject={onReject}
            onDeliverableUpload={onDeliverableUpload}
            onWatermarkUpdate={onWatermarkUpdate}
            onShowPaymentProofPreview={() => {}}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MilestoneCard;
