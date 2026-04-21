import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export function FingerprintIcon({
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
      <Path d="M12 1C6.5 1 2 5.5 2 11v2c0 2.8 1.2 5.3 3 7" />
      <Path d="M12 1c5.5 0 10 4.5 10 10v2c0 2.8-1.2 5.3-3 7" />
      <Path d="M12 11c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2s2-.9 2-2v-2c0-1.1-.9-2-2-2z" />
      <Path d="M8 11v4c0 2.2 1.8 4 4 4s4-1.8 4-4v-4" />
      <Path d="M6 11v4c0 3.3 2.7 6 6 6s6-2.7 6-6v-4" />
    </Svg>
  );
}
