import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Mail, RotateCcw, Edit, ChevronDown, ChevronUp } from 'lucide-react';

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
          icon: <Clock className="w-5 h-5 text-orange-500" />,
          badge: <Badge variant="outline" className="text-orange-600">Pending Approval</Badge>,
          title: 'Contract Awaiting Approval',
          description: 'Your contract has been sent to the client for review and approval.',
          showResend: true,
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          badge: <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>,
          title: 'Contract Approved',
          description: 'Great! Your client has approved the contract. You can now begin work on the project.',
          showResend: false,
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          badge: <Badge variant="destructive">Changes Requested</Badge>,
          title: 'Contract Requires Changes',
          description: 'Your client has requested changes to the project proposal.',
          showResend: true,
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          badge: <Badge variant="outline">Unknown</Badge>,
          title: 'Contract Status',
          description: 'Contract status information',
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
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span className="text-xs">{isExpanded ? 'Hide' : 'Details'}</span>
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
                    <Edit className="w-4 h-4" />
                    Update & Resend
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onResendContract}
                    disabled={isResending}
                    className="gap-2"
                  >
                    {isResending ? (
                      <RotateCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    Resend Contract
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
                Approved {new Date(contractApprovedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {contractSentAt && (
            <div className="text-sm text-muted-foreground">
              <strong>Sent:</strong> {new Date(contractSentAt).toLocaleDateString()}
            </div>
          )}
          
          {contractStatus === 'approved' && contractApprovedAt && (
            <div className="text-sm text-green-600">
              <strong>Approved:</strong> {new Date(contractApprovedAt).toLocaleDateString()}
            </div>
          )}
          
          {contractStatus === 'rejected' && rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Client Feedback:</h4>
              <p className="text-sm text-red-700 whitespace-pre-wrap">{rejectionReason}</p>
            </div>
          )}
          
          {contractStatus === 'pending' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-700">
                The client will receive an email with the contract details and approval options. 
                Once approved, work can begin on the project.
              </p>
            </div>
          )}

          {/* Contract Terms Details */}
          {(contractTerms || paymentTerms || projectScope || revisionPolicy) && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-t pt-4">Contract Details</h4>
              
              {contractTerms && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Terms & Conditions</h5>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{contractTerms}</div>
                </div>
              )}
              
              {paymentTerms && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Payment Terms</h5>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{paymentTerms}</div>
                </div>
              )}
              
              {projectScope && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Project Scope</h5>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{projectScope}</div>
                </div>
              )}
              
              {revisionPolicy && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Revision Policy</h5>
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