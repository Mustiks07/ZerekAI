import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HeartIconProps {
  size?: number;
  filled?: boolean;
  color?: string;
}

/**
 * Heart icon for lives — matches дизайн.html Heart component.
 */
export function HeartIcon({ size = 20, filled = true, color = '#E63946' }: HeartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5C9 5 11 7 12 8.5C13 7 15 5 17.5 5C21.5 5 23 9 21.5 12C19 16.5 12 21 12 21Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}
