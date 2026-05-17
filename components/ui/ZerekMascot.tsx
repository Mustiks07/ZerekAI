import React from 'react';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { Colors } from '@/constants/colors';

interface ZerekMascotProps {
  size?: number;
}

/**
 * Zerek — geometric owl-ish mascot.
 * Based on the design system from дизайн.html.
 */
export function ZerekMascot({ size = 80 }: ZerekMascotProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* shadow */}
      <Ellipse cx={50} cy={92} rx={28} ry={4} fill="rgba(0,0,0,0.08)" />
      {/* body */}
      <Path
        d="M50 12 C72 12, 84 30, 84 52 C84 74, 70 88, 50 88 C30 88, 16 74, 16 52 C16 30, 28 12, 50 12 Z"
        fill={Colors.primary}
      />
      {/* belly */}
      <Path
        d="M50 38 C62 38, 70 48, 70 60 C70 74, 62 82, 50 82 C38 82, 30 74, 30 60 C30 48, 38 38, 50 38 Z"
        fill={Colors.primarySoft}
      />
      {/* ear tufts */}
      <Path d="M22 18 L30 28 L20 32 Z" fill={Colors.primary} />
      <Path d="M78 18 L70 28 L80 32 Z" fill={Colors.primary} />
      {/* eyes */}
      <Circle cx={38} cy={46} r={9} fill="#fff" />
      <Circle cx={62} cy={46} r={9} fill="#fff" />
      <Circle cx={39} cy={47} r={4.5} fill={Colors.ink} />
      <Circle cx={63} cy={47} r={4.5} fill={Colors.ink} />
      <Circle cx={40} cy={45} r={1.5} fill="#fff" />
      <Circle cx={64} cy={45} r={1.5} fill="#fff" />
      {/* beak */}
      <Path d="M50 54 L46 60 L54 60 Z" fill={Colors.accent} />
      {/* cheeks */}
      <Circle cx={32} cy={58} r={3} fill={Colors.accent} opacity={0.5} />
      <Circle cx={68} cy={58} r={3} fill={Colors.accent} opacity={0.5} />
    </Svg>
  );
}
