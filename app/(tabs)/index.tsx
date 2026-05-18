import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { HeartBadge } from '@/components/ui/HeartBadge';
import { DailyLessonCard } from '@/components/home/DailyLessonCard';
import { SubjectProgressCard } from '@/components/home/SubjectProgressCard';
import { WeeklyProgress } from '@/components/home/WeeklyProgress';
import { Colors } from '@/constants/colors';
import { useStore } from '@/store/useStore';
import { useStreak } from '@/hooks/useStreak';
import { useProgress, MOCK_SUBJECTS, MOCK_TOPICS } from '@/hooks/useProgress';
import { supabase } from '@/lib/supabase';
import type { DayActivity, Subject, Topic, UserProgress } from '@/types';

interface ContinueItem {
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  subjectColor: string;
  topicId: string;
  topicName: string;
  progress: number;
}

interface DailyLesson {
  subjectName: string;
  topicId: string;
  topicName: string;
  questionsCount: number;
}

const DAY_LABELS = ['Жк', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн'];

export default function HomeScreen() {
  const { user, streak } = useStore();
  const { currentStreak } = useStreak();
  const { loadSubjects, loadTopics } = useProgress();
  const name = user?.full_name?.split(' ')[0] ?? 'Оқушы';

  const [weeklyData, setWeeklyData] = useState<DayActivity[]>([]);
  const [continueItems, setContinueItems] = useState<ContinueItem[]>([]);
  const [dailyLesson, setDailyLesson] = useState<DailyLesson | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadHomeData();
    }
  }, [user?.id]);

  const loadHomeData = async () => {
    if (!user?.id) return;

    // Weekly activity from xp_logs (last 7 days)
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: xpLogs } = await supabase
        .from('xp_logs')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo);

      const activeDates = new Set(
        (xpLogs ?? []).map(l => new Date(l.created_at).toISOString().split('T')[0])
      );

      const days: DayActivity[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        days.push({ day: DAY_LABELS[d.getDay()], completed: activeDates.has(dateStr) });
      }
      setWeeklyData(days);
    } catch {
      setWeeklyData(DAY_LABELS.map(d => ({ day: d, completed: false })));
    }

    // Continue subjects from selected_subjects
    const selectedIds = user.selected_subjects ?? [];
    if (selectedIds.length === 0) return;

    try {
      const allSubjects = await loadSubjects();
      const subjectMap = new Map<string, Subject>(allSubjects.map(s => [s.id, s]));

      const items: ContinueItem[] = [];
      let firstLesson: DailyLesson | null = null;

      for (const subjectId of selectedIds.slice(0, 3)) {
        const subject = subjectMap.get(subjectId);
        if (!subject) continue;

        const topics = await loadTopics(subjectId);
        if (!topics.length) continue;

        const topicIds = topics.map(t => t.id);
        const { data: progressRows } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('topic_id', topicIds);

        const progressMap = new Map<string, UserProgress>(
          (progressRows ?? []).map(p => [p.topic_id, p])
        );

        const completedCount = topics.filter(t => progressMap.get(t.id)?.is_completed).length;
        const progress = topics.length > 0 ? completedCount / topics.length : 0;

        // Find the current topic (first incomplete)
        const currentTopic = topics.find(t => !progressMap.get(t.id)?.is_completed) ?? topics[0];

        // Soft color map
        const colorMap: Record<string, string> = {
          '#2D6A4F': '#D8F3DC',
          '#3A86FF': '#E0EEFF',
          '#E76F51': '#FDE8E2',
          '#F4A261': '#FDF0E6',
          '#52B788': '#D8F3DC',
          '#9B5DE5': '#F0E5FA',
          '#00BBF9': '#E0F7FF',
          '#4361EE': '#E5E9FF',
          '#06D6A0': '#D9FBF2',
          '#8D6E63': '#EFE6E2',
        };

        items.push({
          subjectId: subject.id,
          subjectName: subject.name_kz,
          subjectIcon: subject.icon,
          subjectColor: subject.color,
          topicId: currentTopic.id,
          topicName: currentTopic.name_kz,
          progress,
        });

        if (!firstLesson) {
          firstLesson = {
            subjectName: subject.name_kz,
            topicId: currentTopic.id,
            topicName: currentTopic.name_kz,
            questionsCount: 10,
          };
        }
      }

      setContinueItems(items);
      setDailyLesson(firstLesson);
    } catch (e) {
      console.warn('Failed to load home data:', e);
    }
  };

  // Fallback daily lesson if data not loaded
  const lesson = dailyLesson;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
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

        {lesson ? (
          <View style={styles.section}>
            <DailyLessonCard
              subjectName={lesson.subjectName}
              topicName={lesson.topicName}
              progress={continueItems.find(c => c.topicId === lesson.topicId)?.progress ?? 0}
              questionsCount={lesson.questionsCount}
              estimatedMinutes={8}
              onPress={() => router.push(`/topic/${lesson.topicId}`)}
            />
          </View>
        ) : null}

        {weeklyData.length > 0 && (
          <View style={styles.section}>
            <WeeklyProgress days={weeklyData} />
          </View>
        )}

        {continueItems.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Жалғастыр</Text>
            {continueItems.map((c) => (
              <View key={c.subjectId} style={styles.continueItem}>
                <SubjectProgressCard
                  name={c.subjectName}
                  icon={c.subjectIcon}
                  color={c.subjectColor}
                  softColor={c.subjectColor + '33'}
                  topicName={c.topicName}
                  progress={c.progress}
                  onPress={() => router.push(`/subject/${c.subjectId}`)}
                />
              </View>
            ))}
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 8, paddingBottom: 14,
  },
  headerLeft: {},
  greeting: { fontSize: 13, color: Colors.ink3, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3 },
  badges: { flexDirection: 'row', gap: 8 },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 13, color: Colors.ink3, fontWeight: '800', letterSpacing: 0.4,
    textTransform: 'uppercase', marginTop: 8, marginBottom: 12, marginLeft: 4,
  },
  continueItem: { marginBottom: 10 },
});
