import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import type { OptionLetter, AnswerState } from '@/types';

interface AnswerOptionProps {
  letter: OptionLetter;
  text: string;
  state: AnswerState;
  onPress: () => void;
  disabled: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Answer option — Duolingo-style with 3D shadow, letter badge.
 * Matches дизайн.html Question screen options.
 */
export function AnswerOption({ letter, text, state, onPress, disabled }: AnswerOptionProps) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (state === 'correct') {
      scale.value = withSequence(
        withSpring(1.05, { damping: 4 }),
        withSpring(1, { damping: 8 })
      );
    } else if (state === 'wrong') {
      shake.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const stateStyles = getStateStyles(state);

  return (
    <AnimatedTouchable
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, stateStyles.container, animatedStyle]}
    >
      <View style={[styles.letterBadge, stateStyles.letterBadge]}>
        <Text style={[styles.letter, stateStyles.letter]}>{letter}</Text>
      </View>
      <Text style={[styles.text, stateStyles.text]} numberOfLines={3}>{text}</Text>
    </AnimatedTouchable>
  );
}

function getStateStyles(state: AnswerState) {
  switch (state) {
    case 'correct':
      return {
        container: {
          backgroundColor: '#D8F3DC',
          borderColor: Colors.good,
          borderBottomColor: Colors.primaryDark,
          borderBottomWidth: 4,
        },
        letterBadge: { backgroundColor: Colors.good },
        letter: { color: '#FFF' },
        text: { color: Colors.good },
      };
    case 'wrong':
      return {
        container: {
          backgroundColor: Colors.badSoft,
          borderColor: Colors.bad,
          borderBottomColor: '#C1121F',
          borderBottomWidth: 4,
        },
        letterBadge: { backgroundColor: Colors.bad },
        letter: { color: '#FFF' },
        text: { color: Colors.bad },
      };
    case 'selected':
      return {
        container: {
          backgroundColor: '#fff',
          borderColor: Colors.primary,
          borderBottomColor: Colors.primaryDark,
          borderBottomWidth: 4,
        },
        letterBadge: { backgroundColor: Colors.primary },
        letter: { color: '#FFF' },
        text: { color: Colors.ink },
      };
    default:
      return {
        container: {
          backgroundColor: '#fff',
          borderColor: Colors.line,
          borderBottomColor: Colors.line,
          borderBottomWidth: 3,
        },
        letterBadge: { backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.line },
        letter: { color: Colors.ink2 },
        text: { color: Colors.ink },
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 2,
    gap: 14,
  },
  letterBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontSize: 15, fontWeight: '800' },
  text: { fontSize: 16, fontWeight: '700', flex: 1 },
});
