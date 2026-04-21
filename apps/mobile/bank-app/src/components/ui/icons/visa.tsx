import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { G, Path, Rect } from 'react-native-svg';

export const Visa = ({ color = '#1434CB', ...props }: SvgProps) => (
  <Svg width={48} height={30} fill="none" viewBox="0 0 48 30" {...props}>
    {/* Background with subtle gradient effect */}
    <Rect width={48} height={30} rx={4} fill="white" />

    {/* VISA logo */}
    <G transform="translate(6, 8)">
      {/* V */}
      <Path
        d="M7.527 1.432L4.91 12.432H1.636L4.255 1.432H7.527Z"
        fill="#1434CB"
      />
      {/* I */}
      <Path
        d="M16.545 1.432L13.927 12.432H10.655L13.273 1.432H16.545Z"
        fill="#1434CB"
      />
      {/* S */}
      <Path
        d="M22.364 1.432C21.273 1.432 19.636 2.068 19.636 3.886C19.636 6.886 23.455 6.886 23.455 8.523C23.455 9.341 22.364 9.705 21.455 9.705C20.182 9.705 19.091 9.159 18.545 8.795L17.818 11.614C18.727 12.159 20 12.432 21.273 12.432C23.818 12.432 26 11.25 26 8.523C26 5.523 22.182 5.341 22.182 3.886C22.182 3.25 22.909 2.886 23.818 2.886C24.727 2.886 25.636 3.25 26.182 3.523L26.909 0.886C26 0.523 24.182 0.159 22.364 1.432Z"
        fill="#1434CB"
      />
      {/* A */}
      <Path
        d="M33.455 1.432L30.545 8.795L29.818 2.341C29.636 1.614 29.091 1.432 28.545 1.432H24L23.818 1.795C24.727 2.068 25.636 2.523 26.182 2.886C26.545 3.25 26.727 3.614 26.909 4.159L28.909 12.432H32.182L37.091 1.432H33.455Z"
        fill="#1434CB"
      />
    </G>

    {/* Blue and gold bars */}
    <Rect x={0} y={24} width={48} height={3} fill="#1434CB" />
    <Rect x={0} y={27} width={48} height={3} fill="#F7B600" />
  </Svg>
);
