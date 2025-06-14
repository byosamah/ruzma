import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SupabaseProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  company: string | null;
  website: string | null;
  bio: string | null;
}

export const useSupabaseAuth = () => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session and set up onAuthStateChange listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch profile, defer with setTimeout for safety
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // Fetch initial session and profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  const fetchUserProfile = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    if (!error && data) {
      setProfile(data);
    } else {
      setProfile(null);
    }
    setLoading(false);
  };

  // For updating profile quickly
  const refreshProfile = () => {
    if (user) fetchUserProfile(user.id);
  };

  return { session, user, profile, loading, refreshProfile };
};
