import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  showShine?: boolean;
}

/**
 * Progress bar with optional shine effect — matches дизайн.html Progress component.
 */
export function ProgressBar({
  progress, height = 12, color = Colors.primary,
  backgroundColor = '#E7E5DC', showShine = true,
}: ProgressBarProps) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  const shineHeight = Math.max(2, height - 8);

  return (
    <View style={[styles.track, { height, backgroundColor, borderRadius: height }]}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, borderRadius: height, height },
          animatedStyle,
        ]}
      >
        {showShine && progress > 0.08 && (
          <View
            style={[
              styles.shine,
              { height: shineHeight, top: 2 },
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0 },
  shine: {
    position: 'absolute',
    left: 6,
    right: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
