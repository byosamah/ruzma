
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
  onEditContract?: () => void;
  isResendingContract?: boolean;
}

function ProjectHeader({
  project,
  onBackClick,
  onEditClick,
  onDeleteClick,
  userCurrency,
  onResendContract,
  onEditContract,
  isResendingContract
}: ProjectHeaderProps) {
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
      {project.contract_status && (
        <ContractStatusCard
          contractStatus={project.contract_status as 'pending' | 'approved' | 'rejected'}
          contractSentAt={project.contract_sent_at}
          contractApprovedAt={project.contract_approved_at}
          rejectionReason={project.contract_rejection_reason}
          onResendContract={onResendContract || (() => {})}
          onEditContract={onEditContract || (() => {})}
          isResending={isResendingContract}
          contractTerms={project.contract_terms}
          paymentTerms={project.payment_terms}
          projectScope={project.project_scope}
          revisionPolicy={project.revision_policy}
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
