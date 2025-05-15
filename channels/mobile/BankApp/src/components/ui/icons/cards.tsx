import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';

export const Cards = ({ color = '#2e7d32', ...props }: SvgProps) => (
  <Svg width={25} height={24} fill="none" viewBox="0 0 25 24" {...props}>
    {/* Background card */}
    <Rect
      x={3.5}
      y={7}
      width={18}
      height={12}
      rx={2}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Magnetic stripe */}
    <Path
      d="M3.5 11h18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Card chip */}
    <Rect
      x={7.5}
      y={14}
      width={4}
      height={3}
      rx={1}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Card number indicator */}
    <Path
      d="M14.5 15.5h4"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14.5 17.5h2"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
