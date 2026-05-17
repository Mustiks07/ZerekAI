import { Config } from '@/constants/config';
import type { Streak } from '@/types';

// ─── XP Calculation ─────────────────────────────────────────────────

export function calculateQuizXP(
  correctCount: number,
  totalQuestions: number,
  isFirstAttempt: boolean
): { totalXP: number; breakdown: XPBreakdown } {
  let totalXP = 0;
  const breakdown: XPBreakdown = {
    correctAnswers: 0,
    perfectBonus: 0,
    firstAttemptBonus: 0,
  };

  // Base XP for correct answers
  breakdown.correctAnswers = correctCount * Config.XP_CORRECT_ANSWER;
  totalXP += breakdown.correctAnswers;

  // Perfect quiz bonus
  if (correctCount === totalQuestions) {
    breakdown.perfectBonus = Config.XP_PERFECT_QUIZ;
    totalXP += breakdown.perfectBonus;
  }

  // First attempt on topic
  if (isFirstAttempt) {
    breakdown.firstAttemptBonus = Config.XP_FIRST_ATTEMPT;
    totalXP += breakdown.firstAttemptBonus;
  }

  return { totalXP, breakdown };
}

export interface XPBreakdown {
  correctAnswers: number;
  perfectBonus: number;
  firstAttemptBonus: number;
}

// ─── Streak Logic ───────────────────────────────────────────────────

export function calculateStreak(streak: Streak): StreakUpdate {
  const today = getDateString(new Date());
  const lastDate = streak.last_activity_date;

  if (lastDate === today) {
    // Already active today — no change
    return {
      current_streak: streak.current_streak,
      longest_streak: streak.longest_streak,
      last_activity_date: today,
      streakBonusXP: 0,
      didMaintain: true,
      didBreak: false,
    };
  }

  const yesterday = getDateString(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  if (lastDate === yesterday) {
    // Consecutive day — increment streak
    const newStreak = streak.current_streak + 1;
    return {
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, streak.longest_streak),
      last_activity_date: today,
      streakBonusXP: Config.XP_STREAK_BONUS,
      didMaintain: true,
      didBreak: false,
    };
  }

  // Streak broken — reset to 1 (today counts)
  return {
    current_streak: 1,
    longest_streak: streak.longest_streak,
    last_activity_date: today,
    streakBonusXP: 0,
    didMaintain: false,
    didBreak: true,
  };
}

export interface StreakUpdate {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streakBonusXP: number;
  didMaintain: boolean;
  didBreak: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getScorePercentage(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

export function getScoreGrade(percentage: number): {
  label: string;
  emoji: string;
  color: string;
} {
  if (percentage >= 90) return { label: 'Керемет!', emoji: '🏆', color: '#2D6A4F' };
  if (percentage >= 70) return { label: 'Жақсы!', emoji: '⭐', color: '#52B788' };
  if (percentage >= 50) return { label: 'Орташа', emoji: '📚', color: '#F4A261' };
  return { label: 'Қайталау керек', emoji: '💪', color: '#E63946' };
}
