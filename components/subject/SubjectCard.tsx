import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface SubjectCardProps {
  name: string;
  icon: string;
  color: string;
  topicsCount?: number;
  isSelected?: boolean;
  onPress: () => void;
}

/**
 * SubjectChip — Duolingo-style subject selection chip with 3D shadow.
 * Matches дизайн.html SubjectChip component.
 */
export function SubjectCard({
  name, icon, color, isSelected, onPress,
}: SubjectCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: isSelected ? color : '#fff',
          borderColor: isSelected ? color : Colors.line,
          borderBottomColor: isSelected ? Colors.primaryDark : Colors.line,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isSelected
              ? 'rgba(255,255,255,0.25)'
              : `${color}22`,
          },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text
        style={[
          styles.name,
          { color: isSelected ? '#fff' : Colors.ink },
        ]}
        numberOfLines={2}
      >
        {name}
      </Text>
      {isSelected && (
        <View style={styles.checkBadge}>
          <Svg width={12} height={12} viewBox="0 0 12 12">
            <Path
              d="M2 6l3 3 5-6"
              stroke={Colors.primary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 4,
    padding: 14,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 26 },
  name: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 16,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
