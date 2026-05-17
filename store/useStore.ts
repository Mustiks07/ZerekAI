import { create } from 'zustand';
import type { UserProfile, Streak, Subject, UserProgress } from '@/types';

// ─── Store Interface ────────────────────────────────────────────────

interface AppState {
  // Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;

  // Streak
  streak: Streak | null;

  // XP
  totalXP: number;
  recentXPGain: number;

  // Progress
  subjectProgress: Map<string, number>; // subjectId → percentage
  topicProgress: Map<string, UserProgress>; // topicId → progress

  // Subjects
  subjects: Subject[];

  // Actions
  setUser: (user: UserProfile | null) => void;
  setAuthenticated: (value: boolean) => void;
  setOnboarded: (value: boolean) => void;
  setStreak: (streak: Streak | null) => void;
  setTotalXP: (xp: number) => void;
  addXP: (amount: number) => void;
  setRecentXPGain: (amount: number) => void;
  setSubjects: (subjects: Subject[]) => void;
  setSubjectProgress: (subjectId: string, percentage: number) => void;
  setTopicProgress: (topicId: string, progress: UserProgress) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isOnboarded: false,
  streak: null,
  totalXP: 0,
  recentXPGain: 0,
  subjectProgress: new Map<string, number>(),
  topicProgress: new Map<string, UserProgress>(),
  subjects: [],
};

export const useStore = create<AppState>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
  setStreak: (streak) => set({ streak }),
  setTotalXP: (totalXP) => set({ totalXP }),
  addXP: (amount) =>
    set((state) => ({ totalXP: state.totalXP + amount, recentXPGain: amount })),
  setRecentXPGain: (recentXPGain) => set({ recentXPGain }),
  setSubjects: (subjects) => set({ subjects }),
  setSubjectProgress: (subjectId, percentage) =>
    set((state) => {
      const newMap = new Map(state.subjectProgress);
      newMap.set(subjectId, percentage);
      return { subjectProgress: newMap };
    }),
  setTopicProgress: (topicId, progress) =>
    set((state) => {
      const newMap = new Map(state.topicProgress);
      newMap.set(topicId, progress);
      return { topicProgress: newMap };
    }),
  reset: () => set(initialState),
}));
