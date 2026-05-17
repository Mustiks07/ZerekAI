import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import type { UserProfile } from '@/types';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, setUser, setAuthenticated, setOnboarded, reset } =
    useStore();

  useEffect(() => {
    // Check initial session
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadProfile(session.user.id);
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfile(session.user.id);
        setAuthenticated(true);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setUser(data as UserProfile);
        setOnboarded(
          (data as UserProfile).selected_subjects.length > 0
        );
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      profile: Omit<UserProfile, 'id' | 'created_at' | 'selected_subjects' | 'goal_score'>
    ) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              ...profile,
              selected_subjects: [],
              goal_score: 80,
            });
          if (profileError) throw profileError;
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    reset();
  }, [reset]);

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
}
