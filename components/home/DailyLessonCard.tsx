import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ZerekMascot } from '@/components/ui/ZerekMascot';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';

interface DailyLessonCardProps {
  subjectName: string;
  topicName: string;
  progress: number; // 0–1
  questionsCount?: number;
  estimatedMinutes?: number;
  onPress: () => void;
}

/**
 * Daily lesson hero card — green bg with mascot, decorative circles,
 * accent progress bar, ChunkyBtn. Matches дизайн.html Home hero.
 */
export function DailyLessonCard({
  subjectName, topicName, progress, questionsCount = 12,
  estimatedMinutes = 8, onPress,
}: DailyLessonCardProps) {
  const pct = Math.round(progress * 100);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.card}>
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        {/* Mascot top-right */}
        <View style={styles.mascot}>
          <ZerekMascot size={56} />
        </View>

        {/* Tag */}
        <View style={styles.tag}>
          <Text style={styles.tagText}>Бүгінгі сабақ</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{topicName}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {subjectName} · {questionsCount} сұрақ · ~{estimatedMinutes} мин
        </Text>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <ProgressBar
              progress={progress}
              color={Colors.accent}
              backgroundColor="rgba(255,255,255,0.2)"
              height={10}
            />
          </View>
          <Text style={styles.progressText}>{pct}%</Text>
        </View>

        {/* Button */}
        <Button
          title="▶ Жалғастыру"
          variant="accent"
          fullWidth={false}
          small
          onPress={onPress}
          style={styles.button}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 20,
    paddingBottom: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  circle2: {
    position: 'absolute',
    bottom: -20,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mascot: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 26,
    letterSpacing: -0.3,
    marginBottom: 4,
    maxWidth: '75%',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  progressBar: {
    flex: 1,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
});
