import { StateCreator } from 'zustand';
import { IAuthService, AuthResult, SignUpData, UpdateProfileData } from '@/lib/services/interfaces';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  currency?: string;
  country?: string;
  user_type: 'free' | 'plus' | 'pro';
  project_count: number;
  storage_used: number;
  notification_settings: any;
  created_at?: string;
  updated_at: string;
}

export interface AuthSlice {
  // State
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: SignUpData) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<{ error?: string }>;
  refreshAuth: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<{ error?: string }>;
  loadProfile: (userId: string) => Promise<void>;
  
  // Internal actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

/**
 * Create auth slice with dependency injection
 * @param authService - Injected auth service implementation
 */
export const createAuthSlice = (authService: IAuthService): StateCreator<AuthSlice> => 
  (set, get) => ({
    // Initial state
    user: null,
    profile: null,
    isLoading: false,
    isInitialized: false,

    // Actions
    login: async (email: string, password: string) => {
      set({ isLoading: true });
      
      try {
        const result: AuthResult = await authService.login(email, password);
        
        if (result.error) {
          set({ isLoading: false });
          return { error: result.error };
        }

        if (result.data?.user) {
          set({ 
            user: result.data.user,
            isLoading: false 
          });
          
          // Load profile after successful login
          await get().loadProfile(result.data.user.id);
        }

        return {};
      } catch (error: any) {
        set({ isLoading: false });
        return { error: error.message || 'Login failed' };
      }
    },

    signUp: async (data: SignUpData) => {
      set({ isLoading: true });
      
      try {
        const result: AuthResult = await authService.signUp(data);
        
        if (result.error) {
          set({ isLoading: false });
          return { error: result.error };
        }

        set({ isLoading: false });
        return {};
      } catch (error: any) {
        set({ isLoading: false });
        return { error: error.message || 'Sign up failed' };
      }
    },

    logout: async () => {
      set({ isLoading: true });
      
      try {
        await authService.logout();
        set({ 
          user: null, 
          profile: null, 
          isLoading: false 
        });
      } catch (error) {
        console.error('Logout error:', error);
        // Clear state even if logout fails
        set({ 
          user: null, 
          profile: null, 
          isLoading: false 
        });
      }
    },

    updateProfile: async (data: UpdateProfileData) => {
      const { user } = get();
      if (!user) return { error: 'User not authenticated' };

      set({ isLoading: true });
      
      try {
        const result = await authService.updateProfile(user.id, data);
        
        if (result.error) {
          set({ isLoading: false });
          return { error: result.error };
        }

        if (result.data) {
          set({ 
            profile: result.data,
            isLoading: false 
          });
        }

        return {};
      } catch (error: any) {
        set({ isLoading: false });
        return { error: error.message || 'Profile update failed' };
      }
    },

    refreshAuth: async () => {
      set({ isLoading: true });
      
      try {
        const result: AuthResult = await authService.refreshAuth();
        
        if (result.data?.user) {
          set({ user: result.data.user });
          await get().loadProfile(result.data.user.id);
        }
        
        set({ 
          isLoading: false,
          isInitialized: true 
        });
      } catch (error) {
        console.error('Auth refresh error:', error);
        set({ 
          user: null,
          profile: null,
          isLoading: false,
          isInitialized: true 
        });
      }
    },

    uploadAvatar: async (file: File) => {
      const { user } = get();
      if (!user) return { error: 'User not authenticated' };

      set({ isLoading: true });
      
      try {
        const result = await authService.uploadAvatar(user.id, file);
        
        if (result.error) {
          set({ isLoading: false });
          return { error: result.error };
        }

        if (result.data) {
          // Update profile with new avatar URL
          await get().updateProfile({ avatar_url: result.data });
        }

        set({ isLoading: false });
        return {};
      } catch (error: any) {
        set({ isLoading: false });
        return { error: error.message || 'Avatar upload failed' };
      }
    },

    // Internal actions
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (isLoading) => set({ isLoading }),
    setInitialized: (isInitialized) => set({ isInitialized }),

    // Helper method for loading profile
    loadProfile: async (userId: string) => {
      try {
        const result = await authService.getProfile(userId);
        
        if (result.data) {
          set({ profile: result.data });
        }
      } catch (error) {
        console.error('Profile load error:', error);
      }
    },
  } as AuthSlice);