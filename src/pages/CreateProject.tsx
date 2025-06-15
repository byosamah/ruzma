
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useProjects } from '@/hooks/useProjects';
import { useT } from '@/lib/i18n';
import { createProjectSchema, CreateProjectFormData } from '@/lib/validators/project';
import ProjectDetailsForm from '@/components/CreateProject/ProjectDetailsForm';
import MilestonesList from '@/components/CreateProject/MilestonesList';

const CreateProject = () => {
  const t = useT();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const { createProject } = useProjects(user);

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      brief: '',
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    if (!user) return;
    const result = await createProject(data);
    if (result) {
      navigate('/dashboard');
    }
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
          <h1 className="text-3xl font-bold text-slate-800">{t('createNewProject')}</h1>
          <p className="text-slate-600 mt-2">{t('setupProjectMilestones')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ProjectDetailsForm />
            <MilestonesList />

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
