
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { Form } from '@/components/ui/form';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import ProjectDetailsForm from '@/components/CreateProject/ProjectDetailsForm';
import MilestonesList from '@/components/CreateProject/MilestonesList';
import SaveAsTemplateCheckbox from '@/components/CreateProject/SaveAsTemplateCheckbox';
import PaymentProofSettings from '@/components/CreateProject/PaymentProofSettings';
import FormActions from '@/components/CreateProject/FormActions';
import { useCreateProjectForm } from '@/hooks/useCreateProjectForm';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';

interface CreateProjectProps {
  user: User;
  profile: any;
}

const CreateProject: React.FC<CreateProjectProps> = ({ user, profile }) => {
  const t = useT();
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const { navigate } = useLanguageNavigation();
  const location = useLocation();

  // Get template data from navigation state
  const templateData = location.state?.template;
  const {
    form,
    addMilestone,
    removeMilestone,
    loadFromTemplate,
    handleSubmit
  } = useCreateProjectForm(templateData);
  const {
    saveTemplate
  } = useProjectTemplates(user);
  const {
    formState: {
      isSubmitting
    }
  } = form;

  // No need for authentication logic - handled by ProtectedRoute

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const onSubmit = async (data: any) => {
    if (!user) return;

    // Save as template if requested
    if (saveAsTemplate && data.name) {
      try {
        await saveTemplate({
          name: data.name,
          brief: data.brief,
          milestones: data.milestones as any
        });
        toast.success('Template saved successfully!');
      } catch (error) {
        console.error('Error saving template:', error);
        toast.error('Failed to save template');
      }
    }
    await handleSubmit(data);
  };

  const handleSaveAsTemplateChange = (checked: boolean | "indeterminate") => {
    setSaveAsTemplate(checked === true);
  };

  return (
    <Layout user={profile || user} onSignOut={handleSignOut}>
      <div className="min-h-screen bg-gray-50/30">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              {templateData ? t('createProjectFromTemplate') : t('createNewProject')}
            </h1>
            <p className="text-gray-600 text-sm">
              {templateData ? t('customizeTemplateAndCreate') : t('setupProjectMilestones')}
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ProjectDetailsForm user={user} />
              <PaymentProofSettings />
              <MilestonesList user={user} />
              <SaveAsTemplateCheckbox checked={saveAsTemplate} onCheckedChange={handleSaveAsTemplateChange} />
              <FormActions isSubmitting={isSubmitting} onCancel={() => navigate('/dashboard')} />
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;
