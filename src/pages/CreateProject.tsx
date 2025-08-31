
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { Form } from '@/components/ui/form';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/profile';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import ProjectDetailsForm from '@/components/CreateProject/ProjectDetailsForm';
import MilestonesList from '@/components/CreateProject/MilestonesList';
import SaveAsTemplateCheckbox from '@/components/CreateProject/SaveAsTemplateCheckbox';
import PaymentProofSettings from '@/components/CreateProject/PaymentProofSettings';
import FormActions from '@/components/CreateProject/FormActions';
import { ContractTermsSection } from '@/components/CreateProject/ContractTermsSection';
import { useProjectManager } from '@/hooks/useProjectManager';

interface CreateProjectProps {
  user: User;
  profile: UserProfile;
}

const CreateProject: React.FC<CreateProjectProps> = ({ user, profile }) => {
  const t = useT();
  const { language } = useLanguage();
  
  const { navigate } = useLanguageNavigation();
  const location = useLocation();

  // Get template data from navigation state
  const templateData = location.state?.template;
  const {
    form,
    addMilestone,
    removeMilestone,
    loadFromTemplate,
    handleSubmit,
    isSubmitting,
    saveAsTemplate: managerSaveAsTemplate,
    setSaveAsTemplate: setManagerSaveAsTemplate,
  } = useProjectManager({ 
    mode: 'create', 
    user, 
    templateData 
  });

  // No need for authentication logic - handled by ProtectedRoute

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSaveAsTemplateChange = (checked: boolean | "indeterminate") => {
    setManagerSaveAsTemplate(checked === true);
  };

  return (
    <Layout user={user} onSignOut={handleSignOut}>
      <div className="min-h-screen bg-gray-50/30" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {templateData ? t('createProjectFromTemplate') : t('createNewProject')}
            </h1>
            <p className="text-gray-600 text-sm">
              {templateData ? t('customizeTemplateAndCreate') : t('setupProjectMilestones')}
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <ProjectDetailsForm user={user} />
              <PaymentProofSettings />
              <MilestonesList user={user} profile={profile} />
              <ContractTermsSection form={form} />
              <SaveAsTemplateCheckbox checked={managerSaveAsTemplate} onCheckedChange={handleSaveAsTemplateChange} />
              <FormActions isSubmitting={isSubmitting} onCancel={() => navigate('/dashboard')} />
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;
