
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreateProjectFormData } from '@/lib/validators/project';
import { calculateProjectDates } from '@/lib/projectDateUtils';
import { securityMonitor } from '@/lib/securityMonitoring';
import { validateProjectName, validateEmail, sanitizeInput } from '@/lib/inputValidation';
import { trackProjectCreated, trackMilestoneCreated, trackError } from '@/lib/analytics';

export const useCreateProjectSubmission = () => {
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (data: CreateProjectFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create a project');
        return;
      }

      // Enhanced input validation
      const projectNameValidation = validateProjectName(data.name);
      if (!projectNameValidation.isValid) {
        toast.error(projectNameValidation.error || 'Invalid project name');
        securityMonitor.monitorValidationFailure(data.name, 'project_name_validation');
        return;
      }

      if (data.clientEmail) {
        const emailValidation = validateEmail(data.clientEmail);
        if (!emailValidation.isValid) {
          toast.error(emailValidation.error || 'Invalid client email');
          securityMonitor.monitorValidationFailure(data.clientEmail, 'email_validation');
          return;
        }
      }

      // Sanitize inputs
      const sanitizedName = sanitizeInput(data.name);
      const sanitizedBrief = sanitizeInput(data.brief);

      // Rate limiting check
      const rateLimitKey = `create_project_${user.id}`;
      if (!securityMonitor.checkRateLimit(rateLimitKey, 5, 300000)) { // 5 attempts per 5 minutes
        toast.error('Too many project creation attempts. Please try again later.');
        return;
      }

      console.log('Creating project for user:', user.id);
      securityMonitor.monitorDataModification('projects', 'create', { userId: user.id });

      // Get user profile to check current status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, project_count, full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        securityMonitor.monitorPermissionViolation('profiles', 'fetch', {
          error: profileError.message,
          userId: user.id
        });
        toast.error('Failed to check user profile');
        return;
      }

      console.log('User profile:', profile);

      // Get actual project count to verify accuracy
      const { data: actualProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id);

      const isFirstProject = !actualProjects || actualProjects.length === 0;

      if (projectsError) {
        console.error('Error fetching actual projects:', projectsError);
      } else {
        console.log('Actual project count:', actualProjects?.length || 0);
        console.log('Profile project count:', profile.project_count);
      }

      // Get user limits
      const { data: limits, error: limitsError } = await supabase
        .rpc('get_user_limits', {
          _user_type: profile.user_type || 'free'
        });

      if (limitsError) {
        console.error('Error getting user limits:', limitsError);
      } else {
        console.log('User limits:', limits);
      }

      // Check project limits before creating
      const { data: limitCheck, error: limitError } = await supabase
        .rpc('check_user_limits', {
          _user_id: user.id,
          _action: 'project'
        });

      console.log('Limit check result:', limitCheck);
      console.log('Limit check error:', limitError);

      if (limitError) {
        console.error('Error checking limits:', limitError);
        securityMonitor.monitorPermissionViolation('projects', 'create_limit_check', {
          error: limitError.message,
          userId: user.id
        });
        toast.error('Failed to check project limits');
        return;
      }

      if (!limitCheck) {
        const userType = profile.user_type || 'free';
        const currentCount = profile.project_count || 0;
        const maxProjects = userType === 'plus' ? 3 : userType === 'pro' ? 10 : 1;
        
        securityMonitor.monitorPermissionViolation('projects', 'create_limit_exceeded', {
          userType,
          currentCount,
          maxProjects,
          userId: user.id
        });
        
        toast.error(`Project limit reached (${currentCount}/${maxProjects}). Please upgrade your plan to create more projects.`);
        return;
      }

      // Look up or create client by email
      let clientId: string | null = null;
      
      if (data.clientEmail) {
        console.log('Looking up client by email:', data.clientEmail);
        
        // First, try to find existing client by email
        const { data: existingClient, error: clientLookupError } = await supabase
          .from('clients')
          .select('id')
          .eq('email', data.clientEmail)
          .eq('user_id', user.id)
          .maybeSingle();

        if (clientLookupError) {
          console.error('Error looking up client:', clientLookupError);
        } else if (existingClient) {
          clientId = existingClient.id;
          console.log('Found existing client:', clientId);
        } else {
          // Client doesn't exist, create a new one
          console.log('Client not found, creating new client');
          
          // Extract name from email if not provided elsewhere
          const clientName = sanitizeInput(data.clientEmail.split('@')[0]);
          
          securityMonitor.monitorDataModification('clients', 'auto_create', { 
            email: data.clientEmail,
            userId: user.id 
          });
          
          const { data: newClient, error: clientCreateError } = await supabase
            .from('clients')
            .insert({
              name: clientName,
              email: data.clientEmail,
              user_id: user.id
            })
            .select('id')
            .single();

          if (clientCreateError) {
            console.error('Error creating client:', clientCreateError);
            securityMonitor.monitorPermissionViolation('clients', 'auto_create', {
              error: clientCreateError.message,
              email: data.clientEmail,
              userId: user.id
            });
            toast.error('Failed to create client record');
            return;
          }

          clientId = newClient.id;
          console.log('Created new client:', clientId);
        }
      }

      // Calculate project dates from milestones
      const { start_date, end_date } = calculateProjectDates(data.milestones);

      // Create the project with proper client linking and payment proof requirement
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: sanitizedName,
          brief: sanitizedBrief,
          client_email: data.clientEmail,
          client_id: clientId,
          user_id: user.id,
          start_date,
          end_date,
          payment_proof_required: data.paymentProofRequired,
          slug: '', // Temporary value, will be overwritten by trigger
        })
        .select()
        .single();

      if (projectError) throw projectError;

      console.log('Project created:', project);

      // Track project creation
      trackProjectCreated(project.id, isFirstProject);

      // Create milestones with input sanitization
      const milestoneInserts = data.milestones.map((milestone) => ({
        project_id: project.id,
        title: sanitizeInput(milestone.title),
        description: sanitizeInput(milestone.description),
        price: milestone.price,
        status: 'pending' as const,
        start_date: milestone.start_date || null,
        end_date: milestone.end_date || null,
      }));

      const { error: milestonesError } = await supabase
        .from('milestones')
        .insert(milestoneInserts);

      if (milestonesError) throw milestonesError;

      // Track milestone creation
      trackMilestoneCreated(project.id, data.milestones.length);

      // Update project count
      const { error: updateError } = await supabase
        .rpc('update_project_count', {
          _user_id: user.id,
          _count_change: 1
        });

      if (updateError) {
        console.error('Error updating project count:', updateError);
      } else {
        console.log('Project count updated successfully');
      }

      // Log successful project creation
      securityMonitor.logEvent('data_modification', {
        resource: 'project',
        action: 'created_successfully',
        projectId: project.id,
        userId: user.id
      });

      toast.success('Project created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
      
      // Track error
      trackError('project_creation', error instanceof Error ? error.message : 'Unknown error', 'useCreateProjectSubmission');
      
      securityMonitor.logEvent('suspicious_activity', {
        activity: 'project_creation_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to create project. Please try again.');
    }
  }, [navigate]);

  return {
    handleSubmit,
  };
};
