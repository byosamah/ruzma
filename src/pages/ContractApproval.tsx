import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SEOHead from '@/components/SEO/SEOHead';

interface Milestone {
  id: string;
  title: string;
  description: string;
  price: number;
  start_date?: string;
  end_date?: string;
}

interface ProjectData {
  id: string;
  name: string;
  brief: string;
  start_date?: string;
  end_date?: string;
  contract_status: string;
  contract_approval_token: string;
  milestones: Milestone[];
  profiles?: {
    full_name: string;
  } | null;
}

const ContractApproval: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  useEffect(() => {
    if (token) {
      fetchProjectData();
    }
  }, [token]);

  const fetchProjectData = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          milestones (
            id,
            title,
            description,
            price,
            start_date,
            end_date
          ),
          profiles!projects_user_id_fkey (
            full_name
          )
        `)
        .eq('contract_approval_token', token)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        toast.error('Invalid or expired contract link');
        return;
      }

      if (!data) {
        toast.error('Contract not found');
        return;
      }

      setProject({
        id: data.id,
        name: data.name,
        brief: data.brief,
        start_date: data.start_date,
        end_date: data.end_date,
        contract_status: data.contract_status,
        contract_approval_token: data.contract_approval_token,
        milestones: data.milestones,
        profiles: Array.isArray(data.profiles) && data.profiles.length > 0 ? data.profiles[0] : null,
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (action: 'approve' | 'reject') => {
    if (!project || !token) return;

    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('approve-contract', {
        body: {
          approvalToken: token,
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        },
      });

      if (error) {
        throw error;
      }

      if (action === 'approve') {
        toast.success('Contract approved successfully! You will receive project access shortly.');
      } else {
        toast.success('Feedback sent to freelancer successfully');
      }

      // Update project status locally
      setProject(prev => prev ? { ...prev, contract_status: data.status } : null);
      
    } catch (error: any) {
      console.error('Error processing contract:', error);
      toast.error(error.message || 'Failed to process contract approval');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Contract Not Found</CardTitle>
            <CardDescription>
              The contract link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalValue = project.milestones.reduce((sum, milestone) => sum + Number(milestone.price), 0);
  const freelancerName = project.profiles?.full_name || 'Freelancer';

  if (project.contract_status !== 'pending') {
    const isApproved = project.contract_status === 'approved';
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <SEOHead 
          title={`Contract ${isApproved ? 'Approved' : 'Processed'}`}
          description={`Contract for ${project.name} has been ${project.contract_status}`}
        />
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            {isApproved ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <CardTitle>
              Contract {isApproved ? 'Approved' : 'Processed'}
            </CardTitle>
            <CardDescription>
              {isApproved 
                ? 'Thank you! You will receive project access shortly.'
                : 'Your feedback has been sent to the freelancer.'
              }
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <SEOHead 
        title={`Contract Approval - ${project.name}`}
        description={`Review and approve the project contract for ${project.name}`}
      />
      
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <Badge variant="outline" className="text-orange-600">
                Pending Approval
              </Badge>
            </div>
            <CardTitle className="text-2xl">Project Contract Review</CardTitle>
            <CardDescription>
              {freelancerName} has submitted a project proposal for your review and approval.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{project.name}</h3>
              <p className="text-muted-foreground mt-2">{project.brief}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="font-semibold">${totalValue.toLocaleString()}</p>
                </div>
              </div>
              
              {project.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-semibold">{new Date(project.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              
              {project.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-semibold">{new Date(project.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Milestones</CardTitle>
            <CardDescription>
              Review the project breakdown and deliverables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.milestones.map((milestone, index) => (
                <div 
                  key={milestone.id} 
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                      {(milestone.start_date || milestone.end_date) && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {milestone.start_date && `From: ${new Date(milestone.start_date).toLocaleDateString()}`}
                          {milestone.start_date && milestone.end_date && ' • '}
                          {milestone.end_date && `To: ${new Date(milestone.end_date).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">${Number(milestone.price).toLocaleString()}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!showRejectionForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Contract Decision</CardTitle>
              <CardDescription>
                Please review the project details above and make your decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => handleApproval('approve')} 
                  disabled={submitting}
                  className="flex-1"
                  size="lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Contract
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectionForm(true)}
                  disabled={submitting}
                  className="flex-1"
                  size="lg"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Request Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Request Changes</CardTitle>
              <CardDescription>
                Please provide feedback on what needs to be changed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Please explain what changes you'd like to see in the project proposal..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => handleApproval('reject')} 
                  disabled={submitting || !rejectionReason.trim()}
                  className="flex-1"
                  variant="destructive"
                >
                  Send Feedback
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRejectionForm(false);
                    setRejectionReason('');
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContractApproval;