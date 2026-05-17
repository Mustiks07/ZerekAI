import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';

interface SubjectProgressCardProps {
  name: string;
  icon: string;
  color: string;
  softColor: string;
  topicName: string;
  progress: number; // 0–1
  onPress: () => void;
}

/**
 * Continue card for home screen — subject progress with icon, name, progress bar.
 * Matches дизайн.html Home "Жалғастыр" cards.
 */
export function SubjectProgressCard({
  name, icon, color, softColor, topicName, progress, onPress,
}: SubjectProgressCardProps) {
  const pct = Math.round(progress * 100);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={[styles.iconBg, { backgroundColor: softColor }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.subject, { color }]}>{name}</Text>
          <Text style={styles.topic}>{topicName}</Text>
          <ProgressBar progress={progress} color={color} height={6} showShine={false} />
        </View>
        <Text style={[styles.percent, { color }]}>{pct}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  iconBg: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  subject: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  topic: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
    marginBottom: 7,
  },
  percent: {
    fontSize: 13,
    fontWeight: '800',
  },
});
