import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, FadeIn, BounceIn } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';
import { getScorePercentage, getScoreGrade } from '@/lib/scoring';

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    quizId: string;
    score: string;
    total: string;
    xp: string;
  }>();

  const score = parseInt(params.score ?? '7', 10);
  const total = parseInt(params.total ?? '10', 10);
  const xp = parseInt(params.xp ?? '70', 10);
  const percentage = getScorePercentage(score, total);
  const grade = getScoreGrade(percentage);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={BounceIn.duration(600)} style={styles.emojiContainer}>
          <Text style={styles.gradeEmoji}>{grade.emoji}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300).duration(400)}>
          <Text style={styles.gradeLabel}>{grade.label}</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(400)} style={styles.scoreCard}>
          <Card style={styles.mainCard}>
            <Text style={styles.scoreLabel}>Нәтиже</Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreValue, { color: grade.color }]}>{score}</Text>
              <Text style={styles.scoreTotal}>/{total}</Text>
            </View>
            <ProgressBar progress={percentage / 100} height={10} color={grade.color} />
            <Text style={styles.percentage}>{percentage}%</Text>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(700).duration(400)} style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statValue}>+{xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Дұрыс</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statEmoji}>❌</Text>
            <Text style={styles.statValue}>{total - score}</Text>
            <Text style={styles.statLabel}>Қате</Text>
          </Card>
        </Animated.View>

        {percentage >= 70 && (
          <Animated.View entering={FadeIn.delay(900).duration(400)}>
            <Card style={styles.congratsCard}>
              <Text style={styles.congratsText}>
                🎉 Тамаша! Тақырып аяқталды деп белгіленді.
              </Text>
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeIn.delay(1100).duration(400)} style={styles.actions}>
          <Button
            title="Қайта тапсыру 🔄"
            variant="secondary"
            onPress={() => router.back()}
          />
          <Button
            title="Басты бетке →"
            onPress={() => router.replace('/(tabs)')}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: 24, alignItems: 'center', paddingTop: 40 },
  emojiContainer: { marginBottom: 8 },
  gradeEmoji: { fontSize: 72 },
  gradeLabel: { fontSize: 28, fontWeight: '800', color: Colors.ink, marginBottom: 24, textAlign: 'center' },
  scoreCard: { width: '100%', marginBottom: 20 },
  mainCard: { padding: 24, alignItems: 'center', gap: 12 },
  scoreLabel: { fontSize: 14, color: Colors.ink3, fontWeight: '500' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline' },
  scoreValue: { fontSize: 56, fontWeight: '800' },
  scoreTotal: { fontSize: 24, fontWeight: '600', color: Colors.ink3 },
  percentage: { fontSize: 14, fontWeight: '600', color: Colors.ink3, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 20 },
  statCard: { flex: 1, padding: 16, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.ink },
  statLabel: { fontSize: 11, color: Colors.ink3 },
  congratsCard: {
    padding: 16, width: '100%', marginBottom: 20,
    backgroundColor: Colors.primarySoft, borderColor: Colors.primary,
    borderWidth: 1, borderRadius: 12,
  },
  congratsText: { fontSize: 14, color: Colors.good, textAlign: 'center', fontWeight: '600' },
  actions: { width: '100%', gap: 12, marginTop: 8 },
});
