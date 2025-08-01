import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
// Icons replaced with emojis
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useT } from '@/lib/i18n';
import { useProjectManager } from '@/hooks/useProjectManager';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { useLanguageNavigation } from '@/hooks/useLanguageNavigation';
const ProjectTemplates = () => {
  const t = useT();
  const {
    navigate
  } = useLanguageNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Use the custom hook instead of local state
  const {
    templates,
    loading,
    deleteTemplate
  } = useProjectTemplates(user);

  // Get user's currency formatting function
  const {
    formatCurrency
  } = useUserCurrency(user);
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setAuthLoading(true);
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
      setAuthLoading(false);
    };
    checkAuthAndLoadData();
  }, []); // Remove navigate dependency to prevent infinite loop

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  const handleCreateFromTemplate = (template: any) => {
    console.log('Creating project from template:', template);
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
    if (!confirm(t('deleteTemplateConfirmation'))) return;
    await deleteTemplate(templateId);
  };
  if (authLoading || loading) {
    return <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </Layout>;
  }
  return <Layout user={profile || user} onSignOut={handleSignOut}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('projectTemplatesTitle')}</h1>
              <p className="text-muted-foreground mt-2">{t('projectTemplatesSubtitle')}</p>
            </div>
          </div>
        </div>

        {templates.length === 0 ? <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <span className="text-6xl text-muted-foreground mx-auto mb-4 block">📄</span>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('noTemplatesYet')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('noTemplatesDesc')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('noTemplatesHint')}
              </p>
            </CardContent>
          </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => <Card key={template.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {template.brief}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)} className="text-red-600 hover:text-red-700">
                        <span className="text-lg">🗑️</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {t('milestoneCount', {
                  count: String(template.milestones.length)
                })}
                    </div>
                    
                    <Button onClick={() => handleCreateFromTemplate(template)} className="w-full">
                      <span className="text-lg mr-2">➕</span>
                      {t('useTemplate')}
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </Layout>;
};
export default ProjectTemplates;