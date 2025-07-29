
import React from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { CurrencyCode } from '@/lib/currency';
import ProjectHeaderActions from './ProjectHeaderActions';
import ContractStatusCard from '@/components/CreateProject/ContractStatusCard';

interface ProjectHeaderProps {
  project: DatabaseProject;
  onBackClick: () => void;
  onEditClick: () => void;
  onDeleteClick?: () => void;
  userCurrency: CurrencyCode;
  onResendContract?: () => void;
  isResendingContract?: boolean;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onBackClick,
  onEditClick,
  onDeleteClick,
  userCurrency,
  onResendContract,
  isResendingContract
}) => {
  return (
    <div className="space-y-4">
      {/* Project Title and Description */}
      <div>
        <h1 className="text-3xl font-medium text-gray-900 mb-2">
          {project.name}
        </h1>
        {project.brief && (
          <p className="text-gray-600 text-lg leading-relaxed">
            {project.brief}
          </p>
        )}
      </div>

      {/* Contract Status */}
      {project.contract_status && project.contract_status !== 'approved' && (
        <ContractStatusCard
          contractStatus={project.contract_status as 'pending' | 'approved' | 'rejected'}
          contractSentAt={project.contract_sent_at}
          contractApprovedAt={project.contract_approved_at}
          rejectionReason={project.contract_rejection_reason}
          onResendContract={onResendContract || (() => {})}
          isResending={isResendingContract}
        />
      )}

      {/* Action Buttons */}
      <ProjectHeaderActions
        project={project}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        isMobile={false}
      />
    </div>
  );
};

export default ProjectHeader;
