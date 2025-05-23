import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, G, Path } from 'react-native-svg';

export const LogoIcon: React.FC<SvgProps & { size?: number }> = ({
  size = 24,
  color = '#2e7d32',
  ...props
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Main Circle */}
      <Circle cx="12" cy="12" r="11" stroke={color} strokeWidth="2" />

      {/* Digital Banking Symbol */}
      <G transform="translate(6, 6)">
        {/* Stylized D for Digital */}
        <Path
          d="M3 2C3 1.44772 3.44772 1 4 1H7C9.20914 1 11 2.79086 11 5V7C11 9.20914 9.20914 11 7 11H4C3.44772 11 3 10.5523 3 10V2Z"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Banking Network Lines */}
        <Path
          d="M2 6H10M6 2V10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};

LogoIcon.displayName = 'LogoIcon';
