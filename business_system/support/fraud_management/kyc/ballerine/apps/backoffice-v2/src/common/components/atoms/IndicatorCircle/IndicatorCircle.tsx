import { FunctionComponent } from 'react';
import { Circle, LucideProps } from 'lucide-react';
import { ctw, IconContainer, IIconContainerProps } from '@ballerine/ui';

export interface IIndicatorCircle extends Omit<LucideProps, 'size'> {
  containerProps?: Omit<IIconContainerProps, 'children'>;
  size?: number;
}

export const IndicatorCircle: FunctionComponent<IIndicatorCircle> = ({
  containerProps,
  size = 24,
  ...props
}) => {
  return (
    <IconContainer {...containerProps} size={size}>
      <Circle
        {...props}
        size={size * 0.55}
        className={ctw('fill-slate-200 stroke-slate-200 stroke-1', props.className)}
      />
    </IconContainer>
  );
};
