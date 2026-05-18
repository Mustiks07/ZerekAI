import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { HeartBadge } from '@/components/ui/HeartBadge';
import { DailyLessonCard } from '@/components/home/DailyLessonCard';
import { SubjectProgressCard } from '@/components/home/SubjectProgressCard';
import { WeeklyProgress } from '@/components/home/WeeklyProgress';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/colors';
import { useStore } from '@/store/useStore';
import { useStreak } from '@/hooks/useStreak';
import { supabase } from '@/lib/supabase';
import { MOCK_SUBJECTS } from '@/hooks/useProgress';
import type { DayActivity, Subject } from '@/types';

interface ContinueCard {
  subjectId: string;
  subjectName: string;
  icon: string;
  color: string;
  softColor: string;
  topicId: string;
  topicName: string;
  progress: number;
}

interface DailyLesson {
  subjectName: string;
  topicId: string;
  topicName: string;
  progress: number;
  questionsCount: number;
}

async function loadWeeklyActivity(userId: string): Promise<DayActivity[]> {
  const DAY_LABELS = ['Жк', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн']; // Sun=0
  const now = new Date();

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  try {
    const { data } = await supabase
      .from('xp_logs')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString());

    const activeDates = new Set((data ?? []).map((d: { created_at: string }) => d.created_at.slice(0, 10)));

    const result: DayActivity[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      result.push({
        day: DAY_LABELS[d.getDay()],
        completed: activeDates.has(d.toISOString().slice(0, 10)),
      });
    }
    return result;
  } catch (e) {
    console.error('loadWeeklyActivity error:', e);
    return [];
  }
}

async function loadContinueCards(
  userId: string,
  selectedSubjectIds: string[],
  allSubjects: Subject[]
): Promise<ContinueCard[]> {
  const cards: ContinueCard[] = [];
  for (const sid of selectedSubjectIds.slice(0, 3)) {
    const subj = allSubjects.find(s => s.id === sid);
    if (!subj) continue;

    try {
      const { data: topics } = await supabase
        .from('topics')
        .select('id, name_kz, order')
        .eq('subject_id', sid)
        .eq('is_active', true)
        .order('order')
        .limit(10);

      if (!topics?.length) continue;

      const { data: progress } = await supabase
        .from('user_progress')
        .select('topic_id, is_completed, best_score')
        .eq('user_id', userId)
        .in('topic_id', topics.map((t: { id: string }) => t.id));

      const progressMap = new Map((progress ?? []).map((p: { topic_id: string; is_completed: boolean; best_score: number }) => [p.topic_id, p]));
      const firstIncomplete = topics.find((t: { id: string }) => !progressMap.get(t.id)?.is_completed) ?? topics[0];
      const prog = progressMap.get(firstIncomplete.id);

      cards.push({
        subjectId: sid,
        subjectName: subj.name_kz,
        icon: subj.icon,
        color: subj.color,
        softColor: subj.color + '22',
        topicId: firstIncomplete.id,
        topicName: firstIncomplete.name_kz,
        progress: prog ? Math.min((prog as { best_score: number }).best_score / 10, 1) : 0,
      });
    } catch (e) {
      console.error('loadContinueCards error for subject', sid, e);
    }
  }
  return cards;
}

/**
 * Home screen — matches дизайн.html Screen 02 Home.
 * All data loaded from Supabase; no hardcoded demo content.
 */
export default function HomeScreen() {
  const { user, subjects } = useStore();
  const { currentStreak } = useStreak();

  const [weeklyData, setWeeklyData] = useState<DayActivity[]>([]);
  const [continueCards, setContinueCards] = useState<ContinueCard[]>([]);
  const [dailyLesson, setDailyLesson] = useState<DailyLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const name = user?.full_name ?? '';

  const loadData = useCallback(async () => {
    if (!user?.id) { setIsLoading(false); return; }

    try {
      // Use subjects from store, fall back to MOCK_SUBJECTS
      const allSubjects = subjects.length > 0 ? subjects : MOCK_SUBJECTS;
      const selectedIds = user.selected_subjects ?? [];

      const [weekly, cards] = await Promise.all([
        loadWeeklyActivity(user.id),
        selectedIds.length > 0
          ? loadContinueCards(user.id, selectedIds, allSubjects)
          : Promise.resolve([]),
      ]);

      setWeeklyData(weekly);
      setContinueCards(cards);

      // Daily lesson: first card's topic
      if (cards.length > 0) {
        const first = cards[0];
        setDailyLesson({
          subjectName: first.subjectName,
          topicId: first.topicId,
          topicName: first.topicName,
          progress: first.progress,
          questionsCount: 10,
        });
      } else {
        setDailyLesson(null);
      }
    } catch (e) {
      Alert.alert('Қате', 'Деректерді жүктеу кезінде қате болды');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.selected_subjects, subjects]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <LoadingSpinner fullScreen message="Жүктелуде..." />
      </SafeAreaView>
    );
  }

  const hasSubjects = (user?.selected_subjects?.length ?? 0) > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Қайырлы күн,</Text>
            <Text style={styles.name}>{name} 👋</Text>
          </View>
          <View style={styles.badges}>
            <StreakBadge count={currentStreak} />
            <HeartBadge count={5} />
          </View>
        </View>

        {!hasSubjects ? (
          /* Empty state — no subjects selected */
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyTitle}>Пән таңда</Text>
            <Text style={styles.emptySubtitle}>
              ҰБТ-ға дайындалу үшін пәндерді таңда
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(auth)/onboarding')}
            >
              <Text style={styles.emptyBtnText}>Пән таңдау →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Daily Lesson Hero */}
            {dailyLesson ? (
              <View style={styles.section}>
                <DailyLessonCard
                  subjectName={dailyLesson.subjectName}
                  topicName={dailyLesson.topicName}
                  progress={dailyLesson.progress}
                  questionsCount={dailyLesson.questionsCount}
                  estimatedMinutes={8}
                  onPress={() => router.push(`/topic/${dailyLesson.topicId}`)}
                />
              </View>
            ) : (
              <View style={[styles.section, styles.allDoneCard]}>
                <Text style={styles.allDoneText}>🎉 Барлық тақырыптар аяқталды!</Text>
              </View>
            )}

            {/* Weekly Streak */}
            {weeklyData.length > 0 && (
              <View style={styles.section}>
                <WeeklyProgress days={weeklyData} />
              </View>
            )}

            {/* Continue subjects */}
            {continueCards.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Жалғастыр</Text>
                {continueCards.map((c) => (
                  <View key={c.subjectId} style={styles.continueItem}>
                    <SubjectProgressCard
                      name={c.subjectName}
                      icon={c.icon}
                      color={c.color}
                      softColor={c.softColor}
                      topicName={c.topicName}
                      progress={c.progress}
                      onPress={() => router.push(`/subject/${c.subjectId}`)}
                    />
                  </View>
                ))}
              </>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerLeft: {},
  greeting: { fontSize: 13, color: Colors.ink3, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3 },
  badges: { flexDirection: 'row', gap: 8 },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 13,
    color: Colors.ink3,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 4,
  },
  continueItem: { marginBottom: 10 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.ink,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.ink3,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  allDoneCard: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  allDoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});
