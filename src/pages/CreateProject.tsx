
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import ProjectDetailsForm from '@/components/CreateProject/ProjectDetailsForm';
import MilestonesList from '@/components/CreateProject/MilestonesList';
import TemplateHeader from '@/components/CreateProject/TemplateHeader';
import SaveAsTemplateCheckbox from '@/components/CreateProject/SaveAsTemplateCheckbox';
import FormActions from '@/components/CreateProject/FormActions';
import { useCreateProjectForm } from '@/hooks/useCreateProjectForm';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';

const CreateProject = () => {
  const t = useT();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get template data from navigation state
  const templateData = location.state?.template;
  const { form, addMilestone, removeMilestone, loadFromTemplate, handleSubmit } = useCreateProjectForm(templateData);
  const { saveTemplate } = useProjectTemplates(user);

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

  const onSubmit = async (data: any) => {
    if (!user) return;
    
    // Save as template if requested
    if (saveAsTemplate && data.name) {
      try {
        await saveTemplate({
          name: data.name,
          brief: data.brief,
          milestones: data.milestones as any,
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
