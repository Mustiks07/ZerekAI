import React from 'react';
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
import type { DayActivity } from '@/types';

/**
 * Home screen — matches дизайн.html Screen 02 Home.
 */
export default function HomeScreen() {
  const { user } = useStore();
  const name = user?.full_name ?? 'Айдана';

  const weeklyData: DayActivity[] = [
    { day: 'Дс', completed: true },
    { day: 'Сс', completed: true },
    { day: 'Ср', completed: true },
    { day: 'Бс', completed: true },
    { day: 'Жм', completed: true },
    { day: 'Сн', completed: false },
    { day: 'Жк', completed: false },
  ];

  const continueSubjects = [
    { id: '1', name: 'Физика', topic: 'Электр өрісі', progress: 0.68, color: '#9B5DE5', soft: '#F0E5FA', icon: '⚛' },
    { id: '2', name: 'Биология', topic: 'Жасуша құрылысы', progress: 0.42, color: '#52B788', soft: '#D8F3DC', icon: '🧬' },
    { id: '3', name: 'Тарих', topic: 'Алтын Орда дәуірі', progress: 0.15, color: '#8D6E63', soft: '#EFE6E2', icon: '📜' },
  ];

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
            <StreakBadge count={27} />
            <HeartBadge count={4} />
          </View>
        </View>

        {/* Daily Lesson Hero */}
        <View style={styles.section}>
          <DailyLessonCard
            subjectName="Математика"
            topicName={'Туынды және оның\nқолданылуы'}
            progress={0.35}
            questionsCount={12}
            estimatedMinutes={8}
            onPress={() => router.push('/topic/t3')}
          />
        </View>

        {/* Weekly Streak */}
        <View style={styles.section}>
          <WeeklyProgress days={weeklyData} />
        </View>

        {/* Continue subjects */}
        <Text style={styles.sectionLabel}>Жалғастыр</Text>
        {continueSubjects.map((c) => (
          <View key={c.id} style={styles.continueItem}>
            <SubjectProgressCard
              name={c.name}
              icon={c.icon}
              color={c.color}
              softColor={c.soft}
              topicName={c.topic}
              progress={c.progress}
              onPress={() => router.push(`/subject/${c.id}`)}
            />
          </View>
        ))}

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
});
