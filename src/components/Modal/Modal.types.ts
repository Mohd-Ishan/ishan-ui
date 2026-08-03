/**
 * Modal.types.ts
 *
 * Type definitions for the Modal component and its config system.
 * This file has zero external dependencies beyond `react`, and no
 * dependency on any other component in the library. It can be
 * copied verbatim into another codebase.
 */

import type { ReactNode, RefObject } from 'react';

/** Recursively makes every property (including nested objects) optional. */
export type DeepPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly any[]
  ? T
  : T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

/** Named breakpoints supported by the responsive system. */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';

/** A value that can optionally vary per breakpoint. */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' | 'custom';

export type ModalPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type ModalAppearance =
  | 'solid'
  | 'glass'
  | 'transparent'
  | 'outlined'
  | 'filled'
  | 'gradient';

export type RadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'pill' | 'custom';
export type ShadowToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
export type AnimationType = 'fade' | 'scale' | 'slide' | 'zoom' | 'spring' | 'none';
export type Easing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
export type Alignment = 'left' | 'center' | 'right';

export interface BorderSideConfig {
  width?: string | number;
  style?: BorderStyle;
  color?: string;
}

export interface SizeConfig {
  /** Named size token. Ignored for any dimension that also has an explicit value below. */
  preset?: ModalSize;
  width?: Responsive<string | number>;
  height?: Responsive<string | number>;
  minWidth?: Responsive<string | number>;
  maxWidth?: Responsive<string | number>;
  minHeight?: Responsive<string | number>;
  maxHeight?: Responsive<string | number>;
}

export interface BackgroundConfig {
  color?: string;
  gradient?: string;
  image?: string;
  /** Reference an existing CSS variable instead of a literal color, e.g. "var(--surface-1)". */
  cssVariable?: string;
  size?: string;
  position?: string;
  repeat?: string;
}

export interface BorderConfig {
  width?: Responsive<string | number>;
  style?: BorderStyle;
  color?: string;
  top?: BorderSideConfig;
  right?: BorderSideConfig;
  bottom?: BorderSideConfig;
  left?: BorderSideConfig;
}

export interface RadiusConfig {
  token?: RadiusToken;
  /** Used when token is "custom". */
  value?: Responsive<string | number>;
  topLeft?: string | number;
  topRight?: string | number;
  bottomLeft?: string | number;
  bottomRight?: string | number;
}

export interface ShadowConfig {
  token?: ShadowToken;
  /** Used when token is "custom". Any valid CSS box-shadow value. */
  value?: string;
}

export interface OverlayConfig {
  color?: string;
  opacity?: number;
  /** Backdrop blur in px (number) or any CSS length (string). */
  blur?: string | number;
  gradient?: string;
  image?: string;
}

export interface AnimationConfig {
  type?: AnimationType;
  duration?: number;
  easing?: Easing;
  /** Only used when type is "slide". */
  slideFrom?: 'top' | 'bottom' | 'left' | 'right';
}

export interface HeaderConfig {
  visible?: boolean;
  divider?: boolean;
  align?: Alignment;
  padding?: Responsive<string | number>;
}

export interface BodyConfig {
  padding?: Responsive<string | number>;
  spacing?: Responsive<string | number>;
  scrollable?: boolean;
  maxHeight?: Responsive<string | number>;
}

export interface FooterConfig {
  visible?: boolean;
  divider?: boolean;
  align?: Alignment | 'space-between';
  sticky?: boolean;
  padding?: Responsive<string | number>;
}

export interface CloseButtonConfig {
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'inside' | 'outside';
  size?: 'sm' | 'md' | 'lg';
  animation?: 'none' | 'spin' | 'scale';
}

export interface ThemeConfig {
  colorScheme?: 'light' | 'dark' | 'auto';
  textColor?: string;
  mutedTextColor?: string;
  accentColor?: string;
}

export interface ResponsiveSystemConfig {
  breakpoints?: Partial<Record<Breakpoint, number>>;
}

/** The fully-resolved, always-fully-populated config shape. */
export interface ModalConfig {
  appearance: ModalAppearance;
  size: SizeConfig;
  position: ModalPosition;
  background: BackgroundConfig;
  border: BorderConfig;
  radius: RadiusConfig;
  shadow: ShadowConfig;
  overlay: OverlayConfig;
  animation: AnimationConfig;
  header: HeaderConfig;
  body: BodyConfig;
  footer: FooterConfig;
  closeButton: CloseButtonConfig;
  responsive: ResponsiveSystemConfig;
  theme: ThemeConfig;
}

/** What presets and the `config` prop accept: any subset of ModalConfig. */
export type ModalConfigInput = DeepPartial<ModalConfig>;

export interface ModalProps {
  /** Whether the modal is open. This is a controlled component. */
  isOpen: boolean;
  /** Called when the modal requests to close (overlay click, Escape, close button). */
  onClose: () => void;
  /** Name of a built-in (or developer-registered) preset. */
  preset?: string;
  /** User-level config overrides, merged on top of default config + preset. */
  config?: ModalConfigInput;
  /** Header title. */
  title?: ReactNode;
  /** Header subtitle. */
  subtitle?: ReactNode;
  /** Header icon, rendered to the left of the title. */
  icon?: ReactNode;
  /** Footer content, typically action buttons. */
  footer?: ReactNode;
  /** Body content. */
  children?: ReactNode;
  /** Extra class name applied to the modal panel. */
  className?: string;
  /** Extra class name applied to the overlay. */
  overlayClassName?: string;
  /** DOM id prefix used for internal aria-labelledby/aria-describedby targets. */
  id?: string;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  /** Element to receive focus when the modal opens. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement>;
  /** Element to receive focus when the modal closes. Defaults to the previously focused element. */
  finalFocusRef?: RefObject<HTMLElement>;
  /** Accessible label, used when there is no visible title. */
  ariaLabel?: string;
  /** Portal container. Defaults to document.body. */
  container?: HTMLElement | null;
  /** Lock body scroll while open. Defaults to true. */
  lockScroll?: boolean;
  /** Called once the open animation has finished. */
  onOpened?: () => void;
  /** Called once the close animation has finished and the modal has left the DOM. */
  onClosed?: () => void;
}
