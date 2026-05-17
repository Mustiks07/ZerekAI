import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';

interface QuizProgressProps {
  current: number;
  total: number;
  score: number;
}

export function QuizProgress({ current, total, score }: QuizProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>
          Сұрақ <Text style={styles.bold}>{current}</Text> / {total}
        </Text>
        <Text style={styles.score}>
          ✅ {score}/{current > 0 ? current - 1 : 0}
        </Text>
      </View>
      <ProgressBar progress={current / total} height={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 14, color: Colors.ink2 },
  bold: { fontWeight: '700', color: Colors.ink },
  score: { fontSize: 14, fontWeight: '600', color: Colors.good },
});
