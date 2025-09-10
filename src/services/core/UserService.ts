import { User } from '@supabase/supabase-js';
import { BaseService } from './BaseService';
import { PLAN_CONFIG } from '@/hooks/subscription/constants';
import { validateSubscriptionAccess } from '@/lib/subscriptionValidator';

export interface UserLimits {
  projectLimit: number;
  currentProjectCount: number;
  isUnlimited: boolean;
  canCreateProject: boolean;
}

export interface ProjectArchivalResult {
  totalProjects: number;
  allowedProjects: number;
  archivedProjects: number;
  archivedProjectIds: string[];
}

export interface UserProfile {
  id: string;
  full_name?: string;
  email?: string;
  currency?: string;
  user_type?: string;
  project_count?: number;
}

export class UserService extends BaseService {
  constructor(user: User | null) {
    super(user);
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const user = this.ensureAuthenticated();

    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('id, full_name, email, currency, user_type, project_count, created_at, updated_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      this.logOperation('user_profile_fetched');
      return profile;
    } catch (error) {
      return this.handleError(error, 'getUserProfile');
    }
  }

  async getUserLimits(): Promise<UserLimits> {
    const user = this.ensureAuthenticated();
    const profile = await this.getUserProfile();
    
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Validate subscription access to ensure user hasn't been downgraded
    const subscriptionValidation = await validateSubscriptionAccess(user.id);
    const effectiveUserType = subscriptionValidation.isValid ? 
      (profile.user_type || 'free') : 'free';

    const currentProjectCount = profile.project_count || 0;
    
    // Get project limit from plan configuration
    const planConfig = PLAN_CONFIG[effectiveUserType as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;
    const projectLimit = planConfig.max_projects;
    
    const isUnlimited = projectLimit === -1;
    const canCreateProject = isUnlimited || currentProjectCount < projectLimit;

    this.logOperation('user_limits_checked', { 
      userType: effectiveUserType, 
      projectLimit: isUnlimited ? 'unlimited' : projectLimit,
      currentProjectCount,
      canCreateProject
    });

    return {
      projectLimit: isUnlimited ? 999999 : projectLimit,
      currentProjectCount,
      isUnlimited,
      canCreateProject
    };
  }

  async updateProjectCount(countChange: number): Promise<void> {
    const user = this.ensureAuthenticated();

    try {
      // First try using the RPC function
      const { error: rpcError } = await this.supabase
        .rpc('update_project_count', {
          _count_change: countChange,
          _user_id: user.id
        });

      if (rpcError) {
        // RPC function failed, falling back to direct update
        // Fallback: Update the project count directly
        const { data: currentProfile, error: fetchError } = await this.supabase
          .from('profiles')
          .select('project_count')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        const currentCount = currentProfile?.project_count || 0;
        const newCount = Math.max(0, currentCount + countChange);

        const { error: updateError } = await this.supabase
          .from('profiles')
          .update({
            project_count: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }
      }

      this.logOperation('project_count_updated', { countChange });
    } catch (error) {
      return this.handleError(error, 'updateProjectCount');
    }
  }

  async getUserBranding() {
    const user = this.ensureAuthenticated();

    try {
      const { data: branding, error } = await this.supabase
        .from('freelancer_branding')
        .select('id, user_id, logo_url, primary_color, secondary_color, freelancer_name, freelancer_title, freelancer_bio, created_at, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return branding;
    } catch (error) {
      return this.handleError(error, 'getUserBranding');
    }
  }

  /**
   * Handle excess projects when user is downgraded to a lower plan
   * Archives oldest projects, keeping the most recently updated ones active
   */
  async handleExcessProjectsOnDowngrade(newPlanType: 'free' | 'plus' | 'pro'): Promise<ProjectArchivalResult> {
    const user = this.ensureAuthenticated();
    
    try {
      // Get new plan limits
      const planConfig = PLAN_CONFIG[newPlanType] || PLAN_CONFIG.free;
      const newProjectLimit = planConfig.max_projects;
      
      // If unlimited, no need to archive anything
      if (newProjectLimit === -1) {
        return {
          totalProjects: 0,
          allowedProjects: 0,
          archivedProjects: 0,
          archivedProjectIds: []
        };
      }

      // Get all user's active projects ordered by last updated (newest first)
      const { data: projects, error: fetchError } = await this.supabase
        .from('projects')
        .select('id, name, slug, updated_at, status')
        .eq('user_id', user.id)
        .neq('status', 'archived')
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const totalProjects = projects?.length || 0;
      const allowedProjects = Math.min(totalProjects, newProjectLimit);
      const projectsToArchive = Math.max(0, totalProjects - newProjectLimit);

      if (projectsToArchive === 0) {
        // User is within limits, no action needed
        return {
          totalProjects,
          allowedProjects,
          archivedProjects: 0,
          archivedProjectIds: []
        };
      }

      // Archive excess projects (oldest ones based on updated_at)
      const projectsToArchiveList = projects!.slice(newProjectLimit);
      const projectIdsToArchive = projectsToArchiveList.map(p => p.id);

      const { error: archiveError } = await this.supabase
        .from('projects')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
          archive_reason: `plan_downgrade_to_${newPlanType}`,
          updated_at: new Date().toISOString()
        })
        .in('id', projectIdsToArchive);

      if (archiveError) {
        throw archiveError;
      }

      // Log the archival for security/audit purposes
      this.logOperation('projects_archived_on_downgrade', {
        newPlanType,
        totalProjects,
        allowedProjects,
        archivedProjects: projectsToArchive,
        archivedProjectIds: projectIdsToArchive
      });

      return {
        totalProjects,
        allowedProjects,
        archivedProjects: projectsToArchive,
        archivedProjectIds: projectIdsToArchive
      };

    } catch (error) {
      return this.handleError(error, 'handleExcessProjectsOnDowngrade');
    }
  }

  /**
   * Get archived projects for the user
   */
  async getArchivedProjects() {
    const user = this.ensureAuthenticated();
    
    try {
      const { data: projects, error } = await this.supabase
        .from('projects')
        .select('id, name, slug, archived_at, archive_reason, total_amount, currency')
        .eq('user_id', user.id)
        .eq('status', 'archived')
        .order('archived_at', { ascending: false });

      if (error) {
        throw error;
      }

      return projects || [];
    } catch (error) {
      return this.handleError(error, 'getArchivedProjects');
    }
  }

  /**
   * Restore an archived project (if user has available slots)
   */
  async restoreArchivedProject(projectId: string): Promise<boolean> {
    const user = this.ensureAuthenticated();
    
    try {
      // Check if user can create more projects
      const limits = await this.getUserLimits();
      if (!limits.canCreateProject) {
        throw new Error('Cannot restore project: project limit reached. Please upgrade your plan.');
      }

      // Restore the project
      const { error: restoreError } = await this.supabase
        .from('projects')
        .update({
          status: 'active',
          archived_at: null,
          archive_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', user.id) // Ensure user owns the project
        .eq('status', 'archived'); // Only restore archived projects

      if (restoreError) {
        throw restoreError;
      }

      this.logOperation('project_restored_from_archive', { projectId });
      return true;

    } catch (error) {
      this.handleError(error, 'restoreArchivedProject');
      return false;
    }
  }
}