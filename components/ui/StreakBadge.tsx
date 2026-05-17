import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlameIcon } from './FlameIcon';
import { Colors } from '@/constants/colors';

interface StreakBadgeProps {
  count: number;
}

/**
 * Streak badge with SVG flame — matches дизайн.html header streak badge.
 */
export function StreakBadge({ count }: StreakBadgeProps) {
  return (
    <View style={styles.container}>
      <FlameIcon size={20} />
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.accentSoft,
  },
  count: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.accentDark,
  },
});
