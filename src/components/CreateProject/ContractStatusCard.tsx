import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/lib/i18n';
// Icons replaced with emojis

interface ContractStatusCardProps {
  contractStatus: 'pending' | 'approved' | 'rejected';
  contractSentAt?: string;
  contractApprovedAt?: string;
  rejectionReason?: string;
  onResendContract: () => void;
  onEditContract: () => void;
  isResending?: boolean;
  contractTerms?: string;
  paymentTerms?: string;
  projectScope?: string;
  revisionPolicy?: string;
}

const ContractStatusCard: React.FC<ContractStatusCardProps> = ({
  contractStatus,
  contractSentAt,
  contractApprovedAt,
  rejectionReason,
  onResendContract,
  onEditContract,
  isResending = false,
  contractTerms,
  paymentTerms,
  projectScope,
  revisionPolicy,
}) => {
  const t = useT();
  const [isExpanded, setIsExpanded] = useState(contractStatus !== 'approved');

  // Auto-collapse when contract is approved
  useEffect(() => {
    if (contractStatus === 'approved') {
      setIsExpanded(false);
    }
  }, [contractStatus]);

  const hasContractDetails = contractTerms || paymentTerms || projectScope || revisionPolicy;

  const getStatusConfig = () => {
    switch (contractStatus) {
      case 'pending':
        return {
          icon: <span className="text-xl text-orange-500">⏰</span>,
          badge: <Badge variant="outline" className="text-orange-600">{t('pendingApproval')}</Badge>,
          title: t('contractAwaitingApproval'),
          description: t('contractAwaitingApprovalDesc'),
          showResend: true,
        };
      case 'approved':
        return {
          icon: <span className="text-xl text-green-500">✅</span>,
          badge: <Badge variant="default" className="bg-green-500 hover:bg-green-600">{t('approved')}</Badge>,
          title: t('contractApprovedTitle'),
          description: t('contractApprovedDesc'),
          showResend: false,
        };
      case 'rejected':
        return {
          icon: <span className="text-xl text-red-500">❌</span>,
          badge: <Badge variant="destructive">{t('changesRequested')}</Badge>,
          title: t('contractRequiresChanges'),
          description: t('contractRequiresChangesDesc'),
          showResend: true,
        };
      default:
        return {
          icon: <span className="text-xl">⏰</span>,
          badge: <Badge variant="outline">{t('unknown')}</Badge>,
          title: t('contractStatus'),
          description: t('contractStatusInfo'),
          showResend: false,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className={isExpanded ? "" : "pb-2"}>
      <CardHeader className={isExpanded ? "" : "pb-3"}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusConfig.icon}
            {statusConfig.badge}
          </div>
          <div className="flex items-center gap-2">
            {hasContractDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="gap-1 h-8 px-2"
              >
                <span className="text-sm">{isExpanded ? '⬆' : '⬇'}</span>
                <span className="text-xs">{isExpanded ? t('hide') : t('details')}</span>
              </Button>
            )}
            {statusConfig.showResend && (
              <div className="flex gap-2">
                {contractStatus === 'rejected' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditContract}
                    disabled={isResending}
                    className="gap-2"
                  >
                    <span className="text-lg">✏️</span>
                    {t('updateAndResend')}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResendContract}
                    disabled={isResending}
                    className="gap-2"
                  >
                    <span className="text-lg">
                      {isResending ? '🔄' : '📧'}
                    </span>
                    {t('resendContract')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        {isExpanded && (
          <>
            <CardTitle>{statusConfig.title}</CardTitle>
            <CardDescription>{statusConfig.description}</CardDescription>
          </>
        )}
        {!isExpanded && (
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{statusConfig.title}</CardTitle>
            {contractStatus === 'approved' && contractApprovedAt && (
              <div className="text-xs text-green-600">
                {t('approved')} {new Date(contractApprovedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {contractSentAt && (
            <div className="text-sm text-muted-foreground">
              <strong>{t('sent')}:</strong> {new Date(contractSentAt).toLocaleDateString()}
            </div>
          )}
          
          {contractStatus === 'approved' && contractApprovedAt && (
            <div className="text-sm text-green-600">
              <strong>{t('approved')}:</strong> {new Date(contractApprovedAt).toLocaleDateString()}
            </div>
          )}
          
          {contractStatus === 'rejected' && rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-red-800 mb-2">{t('clientFeedback')}:</h4>
              <p className="text-sm text-red-700 whitespace-pre-wrap">{rejectionReason}</p>
            </div>
          )}
          
          {contractStatus === 'pending' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-700">
                {t('clientWillReceiveEmail')}
              </p>
            </div>
          )}

          {/* Contract Terms Details */}
          {(contractTerms || paymentTerms || projectScope || revisionPolicy) && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-t pt-4">{t('contractDetails')}</h4>
              
              {contractTerms && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{t('termsAndConditions')}</h5>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{contractTerms}</div>
                </div>
              )}
              
              {paymentTerms && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{t('paymentTerms')}</h5>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{paymentTerms}</div>
                </div>
              )}
              
              {projectScope && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{t('projectScope')}</h5>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{projectScope}</div>
                </div>
              )}
              
              {revisionPolicy && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{t('revisionPolicy')}</h5>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{revisionPolicy}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ContractStatusCard;