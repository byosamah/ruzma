import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/lib/i18n';
import ClientDropdown from '@/components/CreateProject/ClientDropdown';

interface EditProjectDetailsFormProps {
  name: string;
  brief: string;
  clientEmail: string;
  onNameChange: (name: string) => void;
  onBriefChange: (brief: string) => void;
  onClientEmailChange: (email: string) => void;
  user?: any;
}

const EditProjectDetailsForm: React.FC<EditProjectDetailsFormProps> = ({
  name,
  brief,
  clientEmail,
  onNameChange,
  onBriefChange,
  onClientEmailChange,
  user
}) => {
  const t = useT();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900">{t('projectDetails')}</h3>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-2">
            {t('projectName')} <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t('projectNamePlaceholder')}
            className="border-gray-300 border h-10 sm:h-9 text-base sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="brief" className="text-sm font-medium text-gray-700 block mb-2">
            {t('projectBrief')} <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="brief"
            value={brief}
            onChange={(e) => onBriefChange(e.target.value)}
            placeholder={t('projectBriefPlaceholder')}
            rows={3}
            className="border-gray-300 border text-base sm:text-sm resize-none"
            required
          />
        </div>

        <div>
          <label htmlFor="clientEmail" className="text-sm font-medium text-gray-700 block mb-2">
            {t('client')}
          </label>
          <ClientDropdown
            value={clientEmail}
            onChange={onClientEmailChange}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProjectDetailsForm;