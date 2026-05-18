import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { TopicRow } from '@/components/subject/TopicRow';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FlameIcon } from '@/components/ui/FlameIcon';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/colors';
import { useProgress, MOCK_SUBJECTS } from '@/hooks/useProgress';
import { useStreak } from '@/hooks/useStreak';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import type { Topic, UserProgress } from '@/types';

/**
 * Subject detail screen — green header with rounded bottom corners,
 * sections with topics. Matches дизайн.html Screen 03 Subject.
 */
export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loadTopics } = useProgress();
  const { currentStreak } = useStreak();
  const { user, subjects } = useStore();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, UserProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Find subject from store first, then fall back to MOCK_SUBJECTS
  const subject = subjects.find(s => s.id === id) ?? MOCK_SUBJECTS.find(s => s.id === id);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        const loadedTopics = await loadTopics(id as string);
        setTopics(loadedTopics);

        if (user?.id && loadedTopics.length > 0) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('topic_id', loadedTopics.map(t => t.id));

          const map = new Map<string, UserProgress>();
          (progressData ?? []).forEach(p => map.set(p.topic_id, p as UserProgress));
          setProgressMap(map);
        }
      } catch (e) {
        Alert.alert('Қате', 'Деректерді жүктеу кезінде қате болды');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, user?.id]);

  const completedCount = topics.filter(t => progressMap.get(t.id)?.is_completed === true).length;
  const progress = topics.length > 0 ? completedCount / topics.length : 0;
  const pct = Math.round(progress * 100);

  const getTopicStatus = (topicId: string, index: number): 'completed' | 'current' | 'locked' => {
    const prog = progressMap.get(topicId);
    if (prog?.is_completed) return 'completed';
    if (prog && prog.best_score > 0) return 'current';
    // First unstarted topic after all completed ones gets 'current'
    const firstUnstartedIndex = topics.findIndex(t => {
      const p = progressMap.get(t.id);
      return !p?.is_completed;
    });
    if (index === firstUnstartedIndex) return 'current';
    return 'locked';
  };

  const getTopicProgress = (topicId: string): number => {
    const prog = progressMap.get(topicId);
    if (!prog) return 0;
    return Math.min(prog.best_score / 10, 1);
  };

  const sections = topics.length > 0
    ? [{ title: '1-Бөлім', done: completedCount === topics.length && topics.length > 0, topics }]
    : [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        {isLoading ? (
          <View style={styles.loadingWrapper}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/subjects')}>
                  <Svg width={14} height={22} viewBox="0 0 14 22" fill="none">
                    <Path d="M12 2L2 11l10 9" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
                <Text style={styles.headerBack}>Пәндер</Text>
              </View>
            </View>
            <LoadingSpinner fullScreen message="Тақырыптар жүктелуде..." />
          </View>
        ) : (
          <FlatList
            data={sections}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <View style={styles.header}>
                {/* Top row */}
                <View style={styles.headerTop}>
                  <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/subjects')}>
                    <Svg width={14} height={22} viewBox="0 0 14 22" fill="none">
                      <Path d="M12 2L2 11l10 9" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                  <Text style={styles.headerBack}>Пәндер</Text>
                  <View style={styles.headerStreak}>
                    <FlameIcon size={14} />
                    <Text style={styles.headerStreakText}> {currentStreak}</Text>
                  </View>
                </View>

                {/* Subject info */}
                <View style={styles.subjectInfo}>
                  <View style={styles.subjectIcon}>
                    <Text style={styles.subjectIconText}>{subject?.icon ?? '∑'}</Text>
                  </View>
                  <View style={styles.subjectMeta}>
                    <Text style={styles.subjectLabel}>Профильдік пән</Text>
                    <Text style={styles.subjectName}>{subject?.name_kz ?? 'Пән'}</Text>
                  </View>
                </View>

                {/* Progress */}
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
            renderItem={({ item: sec }) => (
              <View style={styles.sectionContainer}>
                {/* Section header */}
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, sec.done && { color: Colors.primary }]}>
                    {sec.title}
                  </Text>
                  {sec.done && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>АЯҚТАЛДЫ</Text>
                    </View>
                  )}
                </View>
                {/* Topics */}
                {sec.topics.map((t, ti) => (
                  <View key={t.id} style={styles.topicItem}>
                    <TopicRow
                      name={t.name_kz}
                      status={getTopicStatus(t.id, ti)}
                      stars={progressMap.get(t.id)?.is_completed ? 3 : 0}
                      progress={getTopicProgress(t.id)}
                      onPress={() => router.push(`/topic/${t.id}`)}
                    />
                  </View>
                ))}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Тақырыптар табылмады</Text>
              </View>
            }
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  list: { paddingBottom: 20 },
  loadingWrapper: { flex: 1 },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 18,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBack: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  headerStreak: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerStreakText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
  },
  subjectIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectIconText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
  },
  subjectMeta: { flex: 1 },
  subjectLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  subjectName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  progressBar: { flex: 1 },
  progressText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  statsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.ink2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  completedBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  topicItem: {
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.ink3,
    textAlign: 'center',
  },
});
