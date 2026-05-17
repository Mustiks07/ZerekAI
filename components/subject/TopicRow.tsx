import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';

interface TopicRowProps {
  name: string;
  description?: string;
  status: 'locked' | 'available' | 'current' | 'completed';
  bestScore?: number;
  stars?: number;
  progress?: number; // 0–1, for current status
  onPress: () => void;
}

/**
 * Topic row — done/current/locked states with icons and stars.
 * Matches дизайн.html Subject screen topic rows.
 */
export function TopicRow({ name, status, stars = 0, progress = 0, onPress }: TopicRowProps) {
  const isLocked = status === 'locked';
  const isDone = status === 'completed';
  const isCurr = status === 'current';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.7}
      style={[
        styles.container,
        isCurr && styles.containerCurrent,
        isLocked && styles.containerLocked,
      ]}
    >
      {/* Status icon */}
      <View
        style={[
          styles.statusIcon,
          isDone && styles.statusDone,
          isCurr && styles.statusCurrent,
          isLocked && styles.statusLocked,
        ]}
      >
        {isDone && (
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="M4 12l5 5 11-12"
              stroke="#fff"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
        {isCurr && (
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path d="M6 4l14 8-14 8z" fill={Colors.primary} />
          </Svg>
        )}
        {isLocked && (
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Rect x={5} y={11} width={14} height={10} rx={2} fill={Colors.ink3} />
            <Path d="M8 11V8a4 4 0 018 0v3" stroke={Colors.ink3} strokeWidth={2} fill="none" />
          </Svg>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        {isDone && stars > 0 && (
          <View style={styles.starsRow}>
            {[0, 1, 2].map(s => (
              <Svg key={s} width={14} height={14} viewBox="0 0 24 24">
                <Path
                  d="M12 2l3 7 7 .8-5 5 1.5 7-6.5-3.6L5.5 22 7 15l-5-5 7-.8z"
                  fill={s < stars ? Colors.accent : Colors.line}
                />
              </Svg>
            ))}
          </View>
        )}
        {isCurr && (
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <ProgressBar progress={progress} height={5} showShine={false} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>
        )}
        {isLocked && (
          <Text style={styles.lockedText}>Алдыңғы тақырыпты бітір</Text>
        )}
      </View>

      {/* Chevron */}
      {!isLocked && (
        <Svg width={8} height={14} viewBox="0 0 8 14">
          <Path
            d="M1 1l6 6-6 6"
            stroke={Colors.ink3}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.line,
  },
  containerCurrent: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderBottomWidth: 4,
    borderBottomColor: Colors.primaryDark,
  },
  containerLocked: {
    opacity: 0.55,
  },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgAlt,
  },
  statusDone: {
    backgroundColor: Colors.primary,
  },
  statusCurrent: {
    backgroundColor: Colors.primarySoft,
  },
  statusLocked: {
    backgroundColor: Colors.bgAlt,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  progressBar: {
    flex: 1,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  lockedText: {
    fontSize: 12,
    color: Colors.ink3,
    marginTop: 2,
  },
});
