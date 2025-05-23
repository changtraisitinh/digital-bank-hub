import { AnyChildren } from '@ballerine/ui';
import React from 'react';

export type BreadcrumbState = 'idle' | 'warning' | 'completed' | 'edit';
export type BreadcrumbElements = 'wrapper' | 'outer' | 'inner';

export interface BreadcrumbsOuterProps {
  className?: string;
  children?: AnyChildren;
  style?: React.CSSProperties;
}

export interface BreadcrumbsInnerProps {
  className?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export interface BreadcrumbsWrapperProps {
  className?: string;
  children?: AnyChildren;
  style?: React.CSSProperties;
}

export interface BreadcrumbContext {
  isActive: boolean;
  elementsProps: {
    outerProps: BreadcrumbsOuterProps;
    innerProps: BreadcrumbsInnerProps;
    wrapperProps: BreadcrumbsWrapperProps;
  };
}

export interface InnerThemeSettings {
  className: string;
  activeClassName?: string;
  styles?: React.CSSProperties;
  activeStyles?: React.CSSProperties;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
}

export interface OuterThemeSettings {
  className: string;
  activeClassName?: string;
  styles?: React.CSSProperties;
  activeStyles?: React.CSSProperties;
}

export interface WrapperThemeSettings {
  className: string;
  activeClassName?: string;
  styles?: React.CSSProperties;
  activeStyles?: React.CSSProperties;
}

export interface BreadcrumbElementSettings {
  inner: InnerThemeSettings;
  outer: OuterThemeSettings;
  wrapper: WrapperThemeSettings;
}

export type BreadcrumbTheme = Record<BreadcrumbState, BreadcrumbElementSettings>;

export type BreadcrumbChildrenCallback = (context: BreadcrumbContext) => React.ReactNode;

export interface BreadcrumbProps {
  state?: BreadcrumbState;
  active?: boolean;
  theme?: BreadcrumbTheme;
  children?: React.ReactNode | BreadcrumbChildrenCallback;
}

export interface BreadcrumbActive {
  id: string;
  state: BreadcrumbState;
}

export interface BreadcrumbItemInput {
  id: string;
  label: string;
  state: BreadcrumbState;
}

export interface BreadcrumbItemRender extends BreadcrumbItemInput {
  active: boolean;
}

export type BreadcrumbsRendererCallback = (
  items: BreadcrumbItemRender[],
  theme: BreadcrumbTheme,
) => React.ReactNode;

export interface BreadcrumbsLabelProps {
  active: boolean;
  state: BreadcrumbState;
  text: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItemInput[];
  active?: BreadcrumbActive | null;
  theme?: BreadcrumbTheme;
  children?: BreadcrumbsRendererCallback;
}
