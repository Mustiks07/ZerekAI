import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface FlameIconProps {
  size?: number;
  color?: string;
}

/**
 * Streak flame icon — matches дизайн.html Flame component.
 */
export function FlameIcon({ size = 24, color = Colors.accent }: FlameIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2 C12 6, 7 8, 7 14 C7 18.4, 9.2 22, 12 22 C14.8 22, 17 18.4, 17 14 C17 11, 15 9, 14 7 C14 9.5, 12.5 10, 12 10 C12 7, 13 5, 12 2 Z"
        fill={color}
      />
      <Path
        d="M12 11 C12 13, 10.5 14, 10.5 17 C10.5 19, 11.2 21, 12 21 C12.8 21, 13.5 19, 13.5 17 C13.5 15, 12.5 14, 12 11 Z"
        fill="#FFE4B8"
      />
    </Svg>
  );
}
