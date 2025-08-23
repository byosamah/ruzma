
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Icons replaced with emojis
import { ClientWithProjectCount } from '@/types/client';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseProject } from '@/hooks/projectTypes';
import { useT } from '@/lib/i18n';

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientWithProjectCount | null;
}

const ClientDetailsDialog: React.FC<ClientDetailsDialogProps> = ({
  open,
  onOpenChange,
  client
}) => {
  const t = useT();
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client && open) {
      fetchClientProjects();
    }
  }, [client, open]);

  const fetchClientProjects = async () => {
    if (!client) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          milestones (*)
        `)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Error fetching client projects handled by UI
        return;
      }

      // Type the data properly to match DatabaseProject interface
      const typedProjects = (data || []).map(project => ({
        ...project,
        milestones: project.milestones.map((milestone: any) => ({
          ...milestone,
          status: milestone.status as 'pending' | 'payment_submitted' | 'approved' | 'rejected',
        }))
      })) as DatabaseProject[];

      setProjects(typedProjects);
    } catch (error) {
      // Error handled by UI
    } finally {
      setLoading(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg text-blue-600">#️⃣</span>
            </div>
            {t('clientDetails')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('clientInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">{client.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span className="text-lg">📧</span>
                    {client.email}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">{t('clientId')}</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {client.id}
                  </code>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('joined')}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-lg">📅</span>
                    {new Date(client.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{t('connectedProjects')}</span>
                <Badge variant="secondary">
                  {client.project_count} {client.project_count === 1 ? t('project') : t('projects')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl text-gray-400">📂</span>
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {project.brief}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {project.milestones?.length || 0} {t('milestones')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-6xl mx-auto mb-3 text-gray-300 block">📂</span>
                  <p>{t('noProjectsFoundForClient')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsDialog;
