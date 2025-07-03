import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import ProjectDetailsForm from '@/components/CreateProject/ProjectDetailsForm';
import MilestonesList from '@/components/CreateProject/MilestonesList';
import TemplateHeader from '@/components/CreateProject/TemplateHeader';
import SaveAsTemplateCheckbox from '@/components/CreateProject/SaveAsTemplateCheckbox';
import PaymentProofSettings from '@/components/CreateProject/PaymentProofSettings';
import FormActions from '@/components/CreateProject/FormActions';
import { useCreateProjectForm } from '@/hooks/useCreateProjectForm';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft } from 'lucide-react';

const CreateProject = () => {
  const t = useT();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setLoading(true);
      const {
        data: {
          user
        },
        error: userError
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }
      setUser(user);
      const {
        data: profileData
      } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setProfile(profileData);
      setLoading(false);
    };
    checkAuthAndLoadData();
  }, [navigate]);

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

  if (loading) {
    return <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </Layout>;
  }

  if (!user) {
    return <div>{t('loading')}</div>;
  }

  return <Layout user={profile || user} onSignOut={handleSignOut}>
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
              <ProjectDetailsForm />
              <PaymentProofSettings />
              <MilestonesList />
              <SaveAsTemplateCheckbox checked={saveAsTemplate} onCheckedChange={handleSaveAsTemplateChange} />
              <FormActions isSubmitting={isSubmitting} onCancel={() => navigate('/dashboard')} />
            </form>
          </Form>
        </div>
      </div>
    </Layout>;
};

export default CreateProject;
