import type { ReactNode, CSSProperties, ElementType, MouseEvent, KeyboardEvent } from 'react';

/* ============================================================================
 * PRIMITIVE / SHARED TYPES
 * ==========================================================================*/

export type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop';

/**
 * Wraps any value type T so it can either be a static value, or an object
 * keyed by breakpoint for responsive overrides.
 *
 * Example:
 *   padding: 24
 *   padding: { mobile: 12, tablet: 16, desktop: 24 }
 */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export type RadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'pill' | 'circle' | number;

export type ShadowToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glass' | { custom: string };

export type Alignment = 'start' | 'center' | 'end' | 'between' | 'around' | 'stretch';

export type ThemeMode = 'light' | 'dark' | 'custom';

/* ============================================================================
 * APPEARANCE
 * ==========================================================================*/

export type AppearanceVariant =
  | 'solid'
  | 'glass'
  | 'transparent'
  | 'outline'
  | 'filled'
  | 'gradient'
  | 'soft'
  | 'elevated';

export interface AppearanceConfig {
  variant?: AppearanceVariant;
  /** Overrides individual style layers regardless of variant */
  opacity?: Responsive<number>;
}

/* ============================================================================
 * LAYOUT
 * ==========================================================================*/

export type LayoutDirection =
  | 'vertical'
  | 'horizontal'
  | 'horizontal-reverse'
  | 'vertical-reverse'
  | 'image-left'
  | 'image-right'
  | 'image-top'
  | 'image-bottom'
  | 'image-background'
  | 'overlay'
  | 'split'
  | 'centered'
  | 'custom';

export interface LayoutConfig {
  direction?: Responsive<LayoutDirection>;
  gap?: Responsive<Size>;
  align?: Alignment;
  justify?: Alignment;
  /** Fraction (0–1) or CSS size given to the media region in split/horizontal layouts */
  mediaSize?: Responsive<string | number>;
  width?: Responsive<string | number>;
  height?: Responsive<string | number>;
  minHeight?: Responsive<string | number>;
  /** Additive sizing controls — accept any valid CSS length: px, rem, %, vw, vh, fit-content, etc. */
  minWidth?: Responsive<string | number>;
  maxWidth?: Responsive<string | number>;
  maxHeight?: Responsive<string | number>;
  /** Escape hatch for `direction: 'custom'` — caller supplies their own grid/flex template */
  customTemplate?: CSSProperties;
}

/* ============================================================================
 * MEDIA
 * ==========================================================================*/

export type MediaType = 'image' | 'video' | 'avatar' | 'icon' | 'svg' | 'node';
export type MediaPosition = 'top' | 'bottom' | 'left' | 'right' | 'background';
export type MediaFit = 'contain' | 'cover' | 'fill' | 'none';

export interface MediaConfig {
  type?: MediaType;
  src?: string;
  alt?: string;
  node?: ReactNode;
  position?: MediaPosition;
  fit?: MediaFit;
  aspectRatio?: string;
  lazy?: boolean;
  overlay?: BackgroundOverlayConfig;
  rounded?: RadiusToken;
  height?: Responsive<string | number>;
  width?: Responsive<string | number>;
}

/* ============================================================================
 * TYPOGRAPHY
 * ==========================================================================*/

export interface TypographyStyle {
  fontFamily?: string;
  fontSize?: Responsive<string | number>;
  fontWeight?: Responsive<string | number>;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  color?: string;
  textTransform?: CSSProperties['textTransform'];
  clamp?: number;
}

export interface TypographyConfig {
  title?: TypographyStyle;
  subtitle?: TypographyStyle;
  description?: TypographyStyle;
  body?: TypographyStyle;
  footer?: TypographyStyle;
  badge?: TypographyStyle;
}

/* ============================================================================
 * HEADER / BODY / FOOTER
 * ==========================================================================*/

export interface HeaderConfig {
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  divider?: boolean;
  align?: Alignment;
  padding?: Responsive<Size>;
  sticky?: boolean;
}

export interface BodyConfig {
  padding?: Responsive<Size>;
  spacing?: Responsive<Size>;
  scrollable?: boolean;
  maxHeight?: Responsive<string | number>;
  align?: Alignment;
  /** Lets config-only (no JSX composition) cards render body content without <Card.Body> children */
  content?: ReactNode;
}

export interface FooterConfig {
  buttons?: ReactNode;
  links?: ReactNode;
  actions?: ReactNode;
  divider?: boolean;
  sticky?: boolean;
  align?: Alignment;
  padding?: Responsive<Size>;
}

/* ============================================================================
 * BADGE
 * ==========================================================================*/

export type BadgePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type BadgeKind = 'status' | 'notification' | 'custom';

export interface BadgeConfig {
  content?: ReactNode;
  position?: BadgePosition;
  kind?: BadgeKind;
  color?: string;
  background?: string;
  pulse?: boolean;
  /** Icon rendered before `content` inside the badge */
  icon?: ReactNode;
  /** Corner rounding for the badge itself — defaults to 'pill' */
  rounded?: RadiusToken;
}

/* ============================================================================
 * ACTIONS
 * ==========================================================================*/

export interface ActionsConfig {
  items?: ReactNode;
  align?: Alignment;
  gap?: Responsive<Size>;
  /** Row of actions, or stacked column — defaults to 'horizontal' */
  direction?: 'horizontal' | 'vertical';
  /** Allow the action row to wrap onto multiple lines instead of overflowing */
  wrap?: boolean;
}

/* ============================================================================
 * BACKGROUND
 * ==========================================================================*/

export interface BackgroundOverlayConfig {
  color?: string;
  opacity?: number;
  gradient?: string;
}

export type BackgroundKind =
  | 'solid'
  | 'gradient'
  | 'glass'
  | 'transparent'
  | 'image'
  | 'video';

export interface BackgroundConfig {
  kind?: BackgroundKind;
  color?: string;
  gradient?: string;
  /** Renders independently from `media` — a full-bleed background layer behind all content */
  image?: string;
  video?: string;
  overlay?: BackgroundOverlayConfig;
  opacity?: number;
  blur?: number;
  /** CSS background-position, e.g. 'center', '50% 20%' — applies to `image` */
  position?: CSSProperties['backgroundPosition'];
  /** CSS background-size, e.g. 'cover', 'contain', '200px auto' — applies to `image` */
  size?: CSSProperties['backgroundSize'];
  /** CSS background-repeat — applies to `image` */
  repeat?: CSSProperties['backgroundRepeat'];
  /** CSS background-attachment — applies to `image` */
  attachment?: CSSProperties['backgroundAttachment'];
}

/* ============================================================================
 * BORDER / RADIUS / SHADOW
 * ==========================================================================*/

export interface BorderSideConfig {
  width?: number;
  color?: string;
  style?: CSSProperties['borderStyle'];
}

export interface BorderConfig {
  width?: number;
  color?: string;
  style?: CSSProperties['borderStyle'];
  top?: BorderSideConfig;
  right?: BorderSideConfig;
  bottom?: BorderSideConfig;
  left?: BorderSideConfig;
}

export interface RadiusConfig {
  all?: RadiusToken;
  topLeft?: RadiusToken;
  topRight?: RadiusToken;
  bottomLeft?: RadiusToken;
  bottomRight?: RadiusToken;
}

export interface ShadowConfig {
  base?: ShadowToken;
  hover?: ShadowToken;
}

/* ============================================================================
 * HOVER / INTERACTION
 * ==========================================================================*/

export type HoverEffect =
  | 'none'
  | 'lift'
  | 'glow'
  | 'border-animation'
  | 'scale'
  | 'rotate'
  | 'tilt'
  | 'shadow'
  | 'background';

export interface HoverConfig {
  effects?: HoverEffect[];
  intensity?: number;
  duration?: number;
}

export interface InteractionConfig {
  clickable?: boolean;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onSelect?: (selected: boolean) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

/* ============================================================================
 * ANIMATION (Framer Motion driven)
 * ==========================================================================*/

export type AnimationPreset =
  | 'none'
  | 'fade'
  | 'scale'
  | 'lift'
  | 'slide'
  | 'zoom'
  | 'spring'
  | 'flip'
  | 'rotate';

export interface AnimationConfig {
  preset?: AnimationPreset;
  duration?: number;
  delay?: number;
  easing?: number[] | string;
  once?: boolean;
  viewportAmount?: number;
}

/* ============================================================================
 * LOADING
 * ==========================================================================*/

export type LoadingKind = 'skeleton' | 'overlay' | 'custom';

export interface LoadingConfig {
  kind?: LoadingKind;
  node?: ReactNode;
  label?: string;
}

/* ============================================================================
 * RESPONSIVE (global behavior toggle)
 * ==========================================================================*/

export interface ResponsiveConfig {
  breakpoints?: Partial<Record<Breakpoint, number>>;
}

/* ============================================================================
 * ACCESSIBILITY
 * ==========================================================================*/

export interface AccessibilityConfig {
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  keyboardNavigable?: boolean;
  focusRing?: boolean;
  respectReducedMotion?: boolean;
}

/* ============================================================================
 * THEME
 * ==========================================================================*/

export interface ThemeConfig {
  mode?: ThemeMode;
  variables?: Record<string, string>;
}

/* ============================================================================
 * ROOT CARD CONFIG
 * ==========================================================================*/

export interface CardConfig {
  as?: ElementType;
  preset?: CardPresetName | (string & {});
  appearance?: AppearanceConfig;
  layout?: LayoutConfig;
  media?: MediaConfig;
  header?: HeaderConfig;
  body?: BodyConfig;
  footer?: FooterConfig;
  badge?: BadgeConfig;
  actions?: ActionsConfig;
  background?: BackgroundConfig;
  border?: BorderConfig;
  radius?: RadiusConfig | RadiusToken;
  shadow?: ShadowConfig | ShadowToken;
  hover?: HoverConfig;
  interaction?: InteractionConfig;
  animation?: AnimationConfig;
  loading?: LoadingConfig;
  responsive?: ResponsiveConfig;
  typography?: TypographyConfig;
  theme?: ThemeConfig;
  accessibility?: AccessibilityConfig;
  className?: string;
  style?: CSSProperties;
}

/** Deep-partial variant used for user-supplied overrides before resolution */
export type PartialCardConfig = {
  [K in keyof CardConfig]?: CardConfig[K] extends object | undefined
    ? Partial<CardConfig[K]>
    : CardConfig[K];
};

export type CardPresetName =
  | 'default'
  | 'minimal'
  | 'modern'
  | 'glass'
  | 'product'
  | 'pricing'
  | 'blog'
  | 'dashboard'
  | 'analytics'
  | 'team'
  | 'portfolio'
  | 'gaming'
  | 'enterprise'
  | 'apple';

/* ============================================================================
 * COMPONENT PROPS
 * ==========================================================================*/

export interface CardProps {
  config?: PartialCardConfig;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface CardMediaProps extends Partial<MediaConfig> {
  className?: string;
  children?: ReactNode;
}

export interface CardHeaderProps extends Partial<HeaderConfig> {
  className?: string;
  children?: ReactNode;
}

export interface CardBodyProps extends Partial<BodyConfig> {
  className?: string;
  children?: ReactNode;
}

export interface CardFooterProps extends Partial<FooterConfig> {
  className?: string;
  children?: ReactNode;
}

export interface CardBadgeProps extends Partial<BadgeConfig> {
  className?: string;
  children?: ReactNode;
}

export interface CardActionsProps extends Partial<ActionsConfig> {
  className?: string;
  children?: ReactNode;
}
