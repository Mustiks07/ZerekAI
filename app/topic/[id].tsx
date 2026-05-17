import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { MOCK_TOPICS } from '@/hooks/useProgress';
import type { Topic } from '@/types';

function findTopic(topicId: string): Topic | undefined {
  for (const topics of Object.values(MOCK_TOPICS)) {
    const t = topics.find(t => t.id === topicId);
    if (t) return t;
  }
  return undefined;
}

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const topic = findTopic(id ?? '');

  return (
    <>
      <Stack.Screen options={{ headerTitle: topic?.name_kz ?? 'Тақырып' }} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>{topic?.name_kz ?? 'Тақырып'}</Text>
            <Text style={styles.description}>
              {topic?.description_kz ?? 'Тақырып сипаттамасы'}
            </Text>
          </View>

          <Card style={styles.theoryCard}>
            <Text style={styles.theoryTitle}>📖 Теория</Text>
            <Text style={styles.theoryText}>
              Бұл тақырып бойынша негізгі теориялық материалдар Supabase-тен жүктеледі.
              Қазір демо режімде жұмыс істеп тұрсыз.
            </Text>
            <View style={styles.keyPoints}>
              <Text style={styles.keyPointsTitle}>Негізгі тұжырымдар:</Text>
              <Text style={styles.keyPoint}>• Формулалар мен анықтамалар</Text>
              <Text style={styles.keyPoint}>• Мысалдар мен есептер</Text>
              <Text style={styles.keyPoint}>• Ережелер мен заңдылықтар</Text>
            </View>
          </Card>

          {topic?.video_url && (
            <Card style={styles.videoCard}>
              <Text style={styles.videoTitle}>🎬 Видео сабақ</Text>
              <Text style={styles.videoText}>Видео қол жетімді</Text>
            </Card>
          )}

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
  header: { gap: 6 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.ink },
  description: { fontSize: 15, color: Colors.ink2, lineHeight: 22 },
  theoryCard: { padding: 20 },
  theoryTitle: { fontSize: 17, fontWeight: '700', color: Colors.ink, marginBottom: 8 },
  theoryText: { fontSize: 14, color: Colors.ink2, lineHeight: 22 },
  keyPoints: { marginTop: 12, gap: 4 },
  keyPointsTitle: { fontSize: 14, fontWeight: '600', color: Colors.ink, marginBottom: 4 },
  keyPoint: { fontSize: 14, color: Colors.ink2 },
  videoCard: { padding: 20, backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  videoTitle: { fontSize: 15, fontWeight: '600', color: Colors.ink },
  videoText: { fontSize: 13, color: Colors.ink3, marginTop: 4 },
  statsCard: { padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.ink3 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.line },
});
