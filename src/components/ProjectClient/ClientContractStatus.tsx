import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Clock } from 'lucide-react';

interface ClientContractStatusProps {
  contractStatus: 'pending' | 'approved' | 'rejected';
  contractSentAt?: string;
  contractApprovedAt?: string;
  contractTerms?: string;
  paymentTerms?: string;
  projectScope?: string;
  revisionPolicy?: string;
}

const ClientContractStatus: React.FC<ClientContractStatusProps> = ({
  contractStatus,
  contractSentAt,
  contractApprovedAt,
  contractTerms,
  paymentTerms,
  projectScope,
  revisionPolicy
}) => {
  const getStatusConfig = () => {
    switch (contractStatus) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-orange-500" />,
          badge: <Badge variant="outline" className="text-orange-600">Pending Your Approval</Badge>,
          title: 'Contract Awaiting Your Review',
          description: 'Please review the contract terms below and approve or request changes.',
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          badge: <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>,
          title: 'Contract Approved',
          description: 'You have approved this contract. Work can now begin on the project.',
        };
      case 'rejected':
        return {
          icon: <FileText className="w-5 h-5 text-red-500" />,
          badge: <Badge variant="destructive">Changes Requested</Badge>,
          title: 'Changes Requested',
          description: 'You have requested changes to this contract. Waiting for freelancer updates.',
        };
      default:
        return {
          icon: <FileText className="w-5 h-5" />,
          badge: <Badge variant="outline">Contract</Badge>,
          title: 'Contract Information',
          description: 'Project contract details',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusConfig.icon}
            {statusConfig.badge}
          </div>
        </div>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {statusConfig.title}
        </CardTitle>
        <CardDescription>{statusConfig.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {contractSentAt && (
          <div className="text-sm text-muted-foreground">
            <strong>Contract Sent:</strong> {new Date(contractSentAt).toLocaleString()}
          </div>
        )}
        
        {contractStatus === 'approved' && contractApprovedAt && (
          <div className="text-sm text-green-600">
            <strong>Approved On:</strong> {new Date(contractApprovedAt).toLocaleString()}
          </div>
        )}

        {/* Contract Terms Sections */}
        {(contractTerms || paymentTerms || projectScope || revisionPolicy) && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Contract Details</h4>
            
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
    </Card>
  );
};

export default ClientContractStatus;