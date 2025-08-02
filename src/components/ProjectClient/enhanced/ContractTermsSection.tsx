import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CreditCard, Target, RefreshCw } from 'lucide-react';
import { DatabaseProject } from '@/types/shared';

interface ContractTermsSectionProps {
  project: DatabaseProject;
}

const ContractTermsSection: React.FC<ContractTermsSectionProps> = ({ project }) => {
  const hasAnyTerms = project.contract_terms || project.payment_terms || project.project_scope || project.revision_policy;

  if (!hasAnyTerms) {
    return null;
  }

  return (
    <motion.section 
      className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <FileText className="w-5 h-5 mr-2 text-primary" />
        Project Documentation
      </h3>
      
      <div className="space-y-4">
        {/* Contract Terms */}
        {project.contract_terms && (
          <div className="collapse collapse-arrow bg-white shadow-sm">
            <input type="checkbox" />
            <div className="collapse-title font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gray-600" />
              Contract Terms & Conditions
            </div>
            <div className="collapse-content">
              <div className="pt-2">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {project.contract_terms}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Payment Terms */}
        {project.payment_terms && (
          <div className="collapse collapse-arrow bg-white shadow-sm">
            <input type="checkbox" />
            <div className="collapse-title font-medium flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
              Payment Terms & Schedule
            </div>
            <div className="collapse-content">
              <div className="pt-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-blue-800 leading-relaxed">
                    {project.payment_terms}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Scope */}
        {project.project_scope && (
          <div className="collapse collapse-arrow bg-white shadow-sm">
            <input type="checkbox" />
            <div className="collapse-title font-medium flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-600" />
              Project Scope & Deliverables
            </div>
            <div className="collapse-content">
              <div className="pt-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-green-800 leading-relaxed">
                    {project.project_scope}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revision Policy */}
        {project.revision_policy && (
          <div className="collapse collapse-arrow bg-white shadow-sm">
            <input type="checkbox" />
            <div className="collapse-title font-medium flex items-center">
              <RefreshCw className="w-4 h-4 mr-2 text-amber-600" />
              Revision Policy
            </div>
            <div className="collapse-content">
              <div className="pt-2">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-amber-800 leading-relaxed">
                    {project.revision_policy}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          📋 These terms govern our working relationship. Please review them carefully and reach out if you have any questions.
        </p>
      </div>
    </motion.section>
  );
};

export default ContractTermsSection;