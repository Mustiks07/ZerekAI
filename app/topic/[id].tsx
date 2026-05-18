import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/colors';
import { MOCK_TOPICS } from '@/hooks/useProgress';
import { getReadingTextsForTopic } from '@/hooks/useReading';
import { fetchTopicById } from '@/hooks/useSupabaseData';
import type { Topic } from '@/types';

function findMockTopic(topicId: string): Topic | undefined {
  for (const topics of Object.values(MOCK_TOPICS)) {
    const t = topics.find((t) => t.id === topicId);
    if (t) return t;
  }
  return undefined;
}

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const readingTexts = getReadingTextsForTopic(id ?? '');

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }

    fetchTopicById(id).then((data) => {
      if (data) {
        setTopic(data);
      } else {
        // Supabase returns nothing — fall back to mock
        const mock = findMockTopic(id);
        if (mock) setTopic(mock);
      }
      setIsLoading(false);
    }).catch(() => {
      const mock = findMockTopic(id ?? '');
      if (mock) setTopic(mock);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Тақырып жүктелуде..." />;
  }

  if (!topic) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Тақырып табылмады.</Text>
          <Button title="← Артқа" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: topic.name_kz }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{topic.name_kz}</Text>
            <Text style={styles.description}>{topic.description_kz}</Text>
          </View>

          {/* Theory */}
          <Card style={styles.theoryCard}>
            <Text style={styles.theoryTitle}>📖 Теория</Text>
            {topic.theory_text ? (
              <Text style={styles.theoryText}>{topic.theory_text}</Text>
            ) : (
              <>
                <Text style={styles.theoryText}>
                  Бұл тақырып бойынша теориялық материал Supabase-тен жүктеледі.
                </Text>
                <View style={styles.keyPoints}>
                  <Text style={styles.keyPointsTitle}>Негізгі тұжырымдар:</Text>
                  <Text style={styles.keyPoint}>• Формулалар мен анықтамалар</Text>
                  <Text style={styles.keyPoint}>• Мысалдар мен есептер</Text>
                  <Text style={styles.keyPoint}>• Ережелер мен заңдылықтар</Text>
                </View>
              </>
            )}
          </Card>

          {/* Video (if available) */}
          {topic.video_url && (
            <Card style={styles.videoCard}>
              <Text style={styles.videoTitle}>🎬 Видео сабақ</Text>
              <Text style={styles.videoDesc}>Видео қол жетімді</Text>
            </Card>
          )}

          {/* Reading texts (Kazakh language) */}
          {readingTexts.length > 0 && (
            <Card style={styles.readingCard}>
              <Text style={styles.readingTitle}>📝 Мәтін оқу</Text>
              <Text style={styles.readingDesc}>
                Мәтінді оқып, сұрақтарға жауап беріңіз — ҰБТ-да жиі кездеседі.
              </Text>
              {readingTexts.map((rt) => (
                <Button
                  key={rt.id}
                  title={rt.title_kz}
                  variant="secondary"
                  small
                  onPress={() => router.push(`/reading/${rt.id}`)}
                  style={styles.readingBtn}
                />
              ))}
            </Card>
          )}

          {/* Stats */}
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>10</Text>
                <Text style={styles.statLabel}>Сұрақ</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>10</Text>
                <Text style={styles.statLabel}>Минут</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>+100</Text>
                <Text style={styles.statLabel}>XP мүмкін</Text>
              </View>
            </View>
          </Card>

          <Button
            title="Тест бастау 🚀"
            onPress={() => router.push(`/quiz/${id}`)}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  errorText: { fontSize: 16, color: Colors.ink2, textAlign: 'center' },

  header: { gap: 6 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.ink },
  description: { fontSize: 15, color: Colors.ink2, lineHeight: 22 },

  theoryCard: { padding: 20 },
  theoryTitle: { fontSize: 17, fontWeight: '700', color: Colors.ink, marginBottom: 10 },
  theoryText: { fontSize: 14, color: Colors.ink2, lineHeight: 22 },
  keyPoints: { marginTop: 12, gap: 4 },
  keyPointsTitle: { fontSize: 14, fontWeight: '600', color: Colors.ink, marginBottom: 4 },
  keyPoint: { fontSize: 14, color: Colors.ink2 },

  videoCard: { padding: 20, backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  videoTitle: { fontSize: 15, fontWeight: '600', color: Colors.ink },
  videoDesc: { fontSize: 13, color: Colors.ink3, marginTop: 4 },

  readingCard: { padding: 18, gap: 8, backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  readingTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  readingDesc: { fontSize: 13, color: Colors.ink2, lineHeight: 20 },
  readingBtn: { marginTop: 4 },

  statsCard: { padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.ink3 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.line },
});
