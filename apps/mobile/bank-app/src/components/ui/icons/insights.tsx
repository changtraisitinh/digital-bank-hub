import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';

export const Insights = ({ color = '#2e7d32', ...props }: SvgProps) => (
  <Svg width={25} height={24} fill="none" viewBox="0 0 25 24" {...props}>
    {/* Bar chart columns */}
    <Rect
      x={4.5}
      y={14}
      width={3}
      height={6}
      rx={1}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x={10.5}
      y={10}
      width={3}
      height={10}
      rx={1}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x={16.5}
      y={4}
      width={3}
      height={16}
      rx={1}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Trend line */}
    <Path
      d="M4.5 10L9 7.5L14.5 9L19.5 4"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
