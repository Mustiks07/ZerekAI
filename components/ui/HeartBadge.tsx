import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeartIcon } from './HeartIcon';
import { Colors } from '@/constants/colors';

interface HeartBadgeProps {
  count: number;
}

/**
 * Heart badge showing remaining lives — matches дизайн.html header hearts.
 */
export function HeartBadge({ count }: HeartBadgeProps) {
  return (
    <View style={styles.container}>
      <HeartIcon size={18} />
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
    borderColor: Colors.badSoft,
  },
  count: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.bad,
  },
});
