import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

interface XPBadgeProps {
  amount: number;
  showAnimation?: boolean;
}

export function XPBadge({ amount, showAnimation = false }: XPBadgeProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (showAnimation && amount > 0) {
      scale.value = withSequence(
        withSpring(1.4, { damping: 4 }),
        withSpring(1, { damping: 8 })
      );
      translateY.value = withSequence(
        withTiming(-20, { duration: 300 }),
        withTiming(0, { duration: 300 })
      );
    }
  }, [amount, showAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.icon}>⚡</Text>
      <Text style={styles.amount}>{amount}</Text>
      <Text style={styles.label}>XP</Text>
    </Animated.View>
  );
}

export function XPPopup({ amount }: { amount: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withTiming(-60, { duration: 1000 });
    opacity.value = withTiming(0, { duration: 1000 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.popup, style]}>
      <Text style={styles.popupText}>+{amount} XP ⚡</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 2,
  },
  icon: { fontSize: 14 },
  amount: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  label: { fontSize: 12, fontWeight: '600', color: Colors.accent, opacity: 0.7 },
  popup: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  popupText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
});
