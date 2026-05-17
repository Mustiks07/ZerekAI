import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlameIcon } from '@/components/ui/FlameIcon';
import { Colors } from '@/constants/colors';
import type { DayActivity } from '@/types';

interface WeeklyProgressProps {
  days: DayActivity[];
}

const DAY_LABELS = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жк'];

/**
 * Weekly streak strip with flame icons in circles,
 * dashed borders for incomplete days. Matches дизайн.html Home streak strip.
 */
export function WeeklyProgress({ days }: WeeklyProgressProps) {
  const weekDays: DayActivity[] = DAY_LABELS.map((label, i) => ({
    day: label,
    completed: days[i]?.completed ?? false,
  }));

  const completedCount = weekDays.filter(d => d.completed).length;
  // "Today" is the last completed day + 1, or the first incomplete
  const todayIndex = weekDays.findIndex(d => !d.completed);
  const actualToday = todayIndex === -1 ? weekDays.length - 1 : Math.max(0, todayIndex);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Апталық серия</Text>
        <Text style={styles.count}>{completedCount}/7 күн</Text>
      </View>
      <View style={styles.dotsRow}>
        {weekDays.map((day, i) => {
          const done = day.completed;
          const isToday = i === actualToday;
          return (
            <View key={i} style={styles.dayColumn}>
              <View
                style={[
                  styles.dot,
                  done ? styles.dotCompleted : styles.dotEmpty,
                  isToday && styles.dotToday,
                ]}
              >
                {done && <FlameIcon size={14} color="#fff" />}
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  isToday && styles.dayLabelToday,
                ]}
              >
                {day.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: '800', color: Colors.ink },
  count: { fontSize: 12, fontWeight: '700', color: Colors.ink3 },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: { alignItems: 'center', gap: 5 },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: Colors.primary,
  },
  dotEmpty: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.line,
    borderStyle: 'dashed',
  },
  dotToday: {
    shadowColor: Colors.primarySoft,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  dayLabel: { fontSize: 11, fontWeight: '700', color: Colors.ink3 },
  dayLabelToday: { color: Colors.primary },
});
