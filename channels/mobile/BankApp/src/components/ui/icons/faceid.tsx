import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export function FaceIDIcon({
  size = 24,
  color = '#000000',
  ...props
}: SvgProps & { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Top Left Corner */}
      <Path d="M7 3H4a1 1 0 0 0-1 1v3" />
      {/* Top Right Corner */}
      <Path d="M17 3h3a1 1 0 0 1 1 1v3" />
      {/* Bottom Left Corner */}
      <Path d="M7 21H4a1 1 0 0 1-1-1v-3" />
      {/* Bottom Right Corner */}
      <Path d="M17 21h3a1 1 0 0 0 1-1v-3" />
      {/* Face Features */}
      <Path d="M9 9h.01" />
      <Path d="M15 9h.01" />
      <Path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
    </Svg>
  );
}
