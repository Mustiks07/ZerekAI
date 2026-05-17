import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, useAnimatedProps } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

interface QuizTimerProps {
  totalSeconds: number;
  isRunning: boolean;
  onTimeUp: () => void;
}

export function QuizTimer({ totalSeconds, isRunning, onTimeUp }: QuizTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining < 60;

  return (
    <View style={[styles.container, isLow && styles.containerLow]}>
      <Text style={styles.icon}>⏱️</Text>
      <Text style={[styles.time, isLow && styles.timeLow]}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  containerLow: { backgroundColor: Colors.badSoft },
  icon: { fontSize: 14 },
  time: { fontSize: 16, fontWeight: '700', color: Colors.ink, fontVariant: ['tabular-nums'] },
  timeLow: { color: Colors.bad },
});
