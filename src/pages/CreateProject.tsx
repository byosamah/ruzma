import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useProjects } from '@/hooks/useProjects';
import { useT } from '@/lib/i18n';
import { createProjectSchema, CreateProjectFormData } from '@/lib/validators/project';
import ProjectDetailsForm from '@/components/CreateProject/ProjectDetailsForm';
import MilestonesList from '@/components/CreateProject/MilestonesList';
import { toast } from 'sonner';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';

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

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: templateData || {
      name: '',
      brief: '',
      clientEmail: '',
      milestones: [{ title: '', description: '', price: 0 }],
    },
    mode: 'onChange',
  });

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

  // If we have template data, update form values
  useEffect(() => {
    if (templateData) {
      form.reset({
        name: templateData.name,
        brief: templateData.brief,
        clientEmail: '',
        milestones: templateData.milestones,
      });
    }
  }, [templateData, form]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const saveProjectAsTemplate = async (data: CreateProjectFormData) => {
    if (!user || !saveAsTemplate) return;
    try {
      // Save to Supabase
      await saveTemplate({
        name: data.name,
        brief: data.brief,
        milestones: data.milestones,
      });
      // toast is handled in hook
    } catch (error) {
      console.error('Error saving template:', error);
      // error toast is handled in hook
    }
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    if (!user) return;
    
    // Save as template if requested
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
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {templateData ? 'Create Project from Template' : t('createNewProject')}
          </h1>
          <p className="text-slate-600 mt-2">
            {templateData ? 'Customize the template and create your project' : t('setupProjectMilestones')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ProjectDetailsForm />
            <MilestonesList />

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveAsTemplate"
                  checked={saveAsTemplate}
                  onCheckedChange={handleSaveAsTemplateChange}
                />
                <label
                  htmlFor="saveAsTemplate"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Save this project structure as a template for future use
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('creating') : t('createProject')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default CreateProject;
