import { StateCreator } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

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
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  refreshAuth: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  // Initial state
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  
  // Actions
  setUser: (user) => set({ user }),
  
  setProfile: (profile) => set({ profile }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  login: async (email, password) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        set({ user: data.user as any });
        
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profile) {
          set({ profile });
        }
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null });
    } finally {
      set({ isLoading: false });
    }
  },
  
  signUp: async (email, password, fullName) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        set({ user: data.user as any });
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateProfile: async (updates) => {
    const { user, profile } = get();
    if (!user || !profile) return { error: 'Not authenticated' };
    
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        set({ profile: data });
      }
      
      return {};
    } catch (error: any) {
      return { error: error.message };
    } finally {
      set({ isLoading: false });
    }
  },
  
  refreshAuth: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      set({ user: user as any });
      
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        set({ profile });
      }
    } else {
      set({ user: null, profile: null });
    }
    
    set({ isInitialized: true });
  },
});