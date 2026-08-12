import Svg, { Path, Rect } from 'react-native-svg';

import { lightColors as colors, statusColors } from '../../theme/colors';

type Variant = 'solid' | 'outline' | 'mono';

interface LogoProps {
  size?: number;
  variant?: Variant;
  /** For 'mono': ink color override (defaults to text). */
  color?: string;
}

/**
 * DosisCare symbol — Monograma D · latido.
 * Grid 220. Below 32px the pulse is dropped; below 24px the D stroke thickens.
 */
export function Logo({ size = 64, variant = 'solid', color }: LogoProps) {
  const showPulse = size >= 32;
  const dStroke = size >= 24 ? 18 : 24;

  const bg = variant === 'solid' ? colors.primary : 'transparent';
  const dColor =
    variant === 'solid' ? '#ffffff' : variant === 'outline' ? colors.primary : color ?? colors.text;
  const pulseColor =
    variant === 'solid' ? colors.greenContainer : variant === 'outline' ? statusColors.ok : color ?? colors.text;

  return (
    <Svg width={size} height={size} viewBox="0 0 220 220">
      {variant === 'solid' ? <Rect x={10} y={10} width={200} height={200} rx={56} fill={bg} /> : null}
      <Path
        d="M72 58 H120 C154 58, 174 82, 174 110 C174 138, 154 162, 120 162 H72 Z"
        fill="none"
        stroke={dColor}
        strokeWidth={dStroke}
        strokeLinejoin="round"
      />
      {showPulse ? (
        <Path
          d="M48 110 H74 L82 88 L100 132 L108 110 H150"
          fill="none"
          stroke={pulseColor}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}
