
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { ArrowLeft, Plus, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useT } from '@/lib/i18n';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';

const ProjectTemplates = () => {
  const t = useT();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Use the custom hook instead of local state
  const {
    templates,
    loading,
    deleteTemplate,
  } = useProjectTemplates(user);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setAuthLoading(true);
      
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
      setAuthLoading(false);
    };

    checkAuthAndLoadData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleCreateFromTemplate = (template: any) => {
    // Navigate to create project with template data
    navigate('/create-project', { 
      state: { 
        template: {
          name: template.name,
          brief: template.brief,
          milestones: template.milestones
        }
      }
    });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    await deleteTemplate(templateId);
  };

  if (authLoading || loading) {
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

  return (
    <Layout user={profile || user} onSignOut={handleSignOut}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Project Templates</h1>
              <p className="text-slate-600 mt-2">Save time by creating projects from templates</p>
            </div>
          </div>
        </div>

        {templates.length === 0 ? (
          <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No Templates Yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first project template to speed up your workflow
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Templates will be automatically created when you save a project as a template
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-800">
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {template.brief}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{template.milestones.length}</span> milestones
                    </div>
                    <div className="text-sm text-slate-600">
                      Total: ${template.milestones.reduce((sum: number, m: any) => sum + m.price, 0).toFixed(2)}
                    </div>
                    <Button 
                      onClick={() => handleCreateFromTemplate(template)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectTemplates;
