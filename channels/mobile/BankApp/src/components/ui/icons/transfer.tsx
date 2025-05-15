import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path } from 'react-native-svg';

export const Transfer = ({ color = '#2e7d32', ...props }: SvgProps) => (
  <Svg width={25} height={24} fill="none" viewBox="0 0 25 24" {...props}>
    <Circle cx={6.5} cy={12} r={3} stroke={color} strokeWidth={2} />
    <Circle cx={18.5} cy={12} r={3} stroke={color} strokeWidth={2} />
    <Path d="M9.5 12h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path
      d="M13.5 9l2 3-2 3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
