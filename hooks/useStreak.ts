import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { calculateStreak } from '@/lib/scoring';
import type { Streak } from '@/types';

export function useStreak() {
  const { streak, setStreak, addXP, user } = useStore();

  useEffect(() => {
    if (user?.id) {
      loadStreak(user.id);
    }
  }, [user?.id]);

  const loadStreak = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setStreak(data as Streak);
      } else {
        // Create initial streak record
        const initialStreak: Omit<Streak, 'id'> = {
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: '',
        };
        const { data: newStreak } = await supabase
          .from('streaks')
          .insert(initialStreak)
          .select()
          .single();
        if (newStreak) setStreak(newStreak as Streak);
      }
    } catch (error) {
      console.error('Streak load error:', error);
      // Mock streak for development
      setStreak({
        id: 'mock-streak',
        user_id: userId,
        current_streak: 5,
        longest_streak: 12,
        last_activity_date: new Date().toISOString().split('T')[0],
      });
    }
  };

  const updateStreak = useCallback(async () => {
    if (!streak || !user?.id) return;

    const update = calculateStreak(streak);

    try {
      await supabase
        .from('streaks')
        .update({
          current_streak: update.current_streak,
          longest_streak: update.longest_streak,
          last_activity_date: update.last_activity_date,
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Streak update error:', error);
    }

    setStreak({
      ...streak,
      current_streak: update.current_streak,
      longest_streak: update.longest_streak,
      last_activity_date: update.last_activity_date,
    });

    if (update.streakBonusXP > 0) {
      addXP(update.streakBonusXP);
    }

    return update;
  }, [streak, user?.id]);

  return {
    streak,
    currentStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
    updateStreak,
  };
}
