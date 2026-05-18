import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { TopicRow } from '@/components/subject/TopicRow';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FlameIcon } from '@/components/ui/FlameIcon';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/colors';
import { useProgress, MOCK_SUBJECTS } from '@/hooks/useProgress';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import type { Topic, UserProgress } from '@/types';

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loadTopics } = useProgress();
  const { user, streak } = useStore();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  const subject = MOCK_SUBJECTS.find(s => s.id === id)
    ?? useStore.getState().subjects.find(s => s.id === id)
    ?? null;

  useEffect(() => {
    if (!id) return;
    (async () => {
      const loadedTopics = await loadTopics(id);
      setTopics(loadedTopics);

      if (user?.id && loadedTopics.length > 0) {
        try {
          const topicIds = loadedTopics.map(t => t.id);
          const { data } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('topic_id', topicIds);
          if (data) {
            const map = new Map<string, UserProgress>();
            (data as UserProgress[]).forEach(p => map.set(p.topic_id, p));
            setProgressMap(map);
          }
        } catch (e) {
          console.warn('Failed to load user_progress:', e);
        }
      }
      setLoading(false);
    })();
  }, [id, user?.id]);

  const completedCount = Array.from(progressMap.values()).filter(p => p.is_completed).length;
  const progress = topics.length > 0 ? completedCount / topics.length : 0;
  const pct = Math.round(progress * 100);

  const getTopicStatus = (topicId: string, index: number): 'completed' | 'current' | 'locked' => {
    const p = progressMap.get(topicId);
    if (p?.is_completed) return 'completed';
    if (p && p.best_score > 0) return 'current';
    // First topic with no progress is the current one
    const firstUncompleted = topics.findIndex(t => {
      const tp = progressMap.get(t.id);
      return !tp?.is_completed;
    });
    if (index === firstUncompleted) return 'current';
    if (index < firstUncompleted || firstUncompleted === -1) return 'locked';
    return 'locked';
  };

  const getTopicProgress = (topicId: string): number => {
    const p = progressMap.get(topicId);
    if (!p) return 0;
    if (p.is_completed) return 1;
    return Math.min(p.attempts * 0.2, 0.9);
  };

  const getTopicStars = (topicId: string): number => {
    const p = progressMap.get(topicId);
    if (!p?.is_completed) return 0;
    if (p.best_score >= 9) return 3;
    if (p.best_score >= 7) return 2;
    return 1;
  };

  const sections = [
    { title: '1-Бөлім', topics: topics.slice(0, 3) },
    { title: '2-Бөлім', topics: topics.slice(3) },
  ].filter(s => s.topics.length > 0);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <LoadingSpinner />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <FlatList
          data={sections}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.backBtn}>
                  <Svg width={14} height={22} viewBox="0 0 14 22" fill="none">
                    <Path d="M12 2L2 11l10 9" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={styles.headerBack}>Пәндер</Text>
                {streak && streak.current_streak > 0 && (
                  <View style={styles.headerStreak}>
                    <FlameIcon size={14} />
                    <Text style={styles.headerStreakText}> {streak.current_streak}</Text>
                  </View>
                )}
              </View>

              <View style={styles.subjectInfo}>
                <View style={styles.subjectIcon}>
                  <Text style={styles.subjectIconText}>{subject?.icon ?? '📚'}</Text>
                </View>
                <View style={styles.subjectMeta}>
                  <Text style={styles.subjectLabel}>Профильдік пән</Text>
                  <Text style={styles.subjectName}>{subject?.name_kz ?? 'Пән'}</Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <ProgressBar
                    progress={progress}
                    color={Colors.accent}
                    backgroundColor="rgba(255,255,255,0.18)"
                    height={10}
                  />
                </View>
                <Text style={styles.progressText}>{pct}%</Text>
              </View>
              <Text style={styles.statsText}>
                {completedCount} / {topics.length} тақырып аяқталды
              </Text>
            </View>
          }
          renderItem={({ item: sec, index: si }) => {
            const globalOffset = sections.slice(0, si).reduce((a, s) => a + s.topics.length, 0);
            const sectionDone = sec.topics.every(t => progressMap.get(t.id)?.is_completed);
            return (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, sectionDone && { color: Colors.primary }]}>
                    {sec.title}
                  </Text>
                  {sectionDone && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>АЯҚТАЛДЫ</Text>
                    </View>
                  )}
                </View>
                {sec.topics.map((t, ti) => {
                  const globalIdx = globalOffset + ti;
                  const status = getTopicStatus(t.id, globalIdx);
                  return (
                    <View key={t.id} style={styles.topicItem}>
                      <TopicRow
                        name={t.name_kz}
                        status={status}
                        stars={getTopicStars(t.id)}
                        progress={getTopicProgress(t.id)}
                        onPress={() => router.push(`/topic/${t.id}`)}
                      />
                    </View>
                  );
                })}
              </View>
            );
          }}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  list: { paddingBottom: 20 },
  header: {
    backgroundColor: Colors.primary, paddingTop: 54, paddingHorizontal: 20,
    paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 18,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  backBtn: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerBack: { flex: 1, fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  headerStreak: {
    backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  headerStreakText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  subjectInfo: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  subjectIcon: {
    width: 60, height: 60, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  subjectIconText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  subjectMeta: { flex: 1 },
  subjectLabel: {
    fontSize: 11, fontWeight: '800', letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase',
  },
  subjectName: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.4, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  progressBar: { flex: 1 },
  progressText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  statsText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  sectionContainer: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '800', color: Colors.ink2, letterSpacing: 0.4, textTransform: 'uppercase',
  },
  completedBadge: { backgroundColor: Colors.primarySoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  completedText: { fontSize: 10, fontWeight: '800', color: Colors.primary },
  topicItem: { marginBottom: 8 },
});
