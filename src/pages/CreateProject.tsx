
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useProjects } from '@/hooks/useProjects';
import { useT } from '@/lib/i18n';
import { CreateProjectFormData } from '@/lib/validators/project';
import ProjectDetailsForm from '@/components/CreateProject/ProjectDetailsForm';
import MilestonesList from '@/components/CreateProject/MilestonesList';
import TemplateHeader from '@/components/CreateProject/TemplateHeader';
import SaveAsTemplateCheckbox from '@/components/CreateProject/SaveAsTemplateCheckbox';
import FormActions from '@/components/CreateProject/FormActions';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';
import { useCreateProjectForm } from '@/hooks/useCreateProjectForm';

const CreateProject = () => {
  const t = useT();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { createProject } = useProjects(user);
  const { saveTemplate } = useProjectTemplates(user);

  // Get template data from navigation state
  const templateData = location.state?.template;
  const { form } = useCreateProjectForm(templateData);

  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      setUser(user);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      setProfile(profileData);
      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const saveProjectAsTemplate = async (data: CreateProjectFormData) => {
    if (!user || !saveAsTemplate) return;
    try {
      await saveTemplate({
        name: data.name,
        brief: data.brief,
        milestones: data.milestones,
      });
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    if (!user) return;
    
    await saveProjectAsTemplate(data);
    
    const result = await createProject(data);
    if (result) {
      navigate('/dashboard');
    }
  };

  const handleSaveAsTemplateChange = (checked: boolean | "indeterminate") => {
    setSaveAsTemplate(checked === true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">{t('loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <div>{t('loading')}</div>;
  }

  return (
    <Layout user={profile || user} onSignOut={handleSignOut}>
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 flex items-center"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('backToDashboard')}
      </Button>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <TemplateHeader hasTemplate={!!templateData} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ProjectDetailsForm />
            <MilestonesList />
            
            <SaveAsTemplateCheckbox
              checked={saveAsTemplate}
              onCheckedChange={handleSaveAsTemplateChange}
            />

            <FormActions
              isSubmitting={isSubmitting}
              onCancel={() => navigate('/dashboard')}
            />
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default CreateProject;
