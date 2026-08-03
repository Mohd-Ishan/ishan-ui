import type { CSSProperties, ReactNode } from "react";

/**
 * core/style/tokens.ts
 *
 * Shared config group shapes for the Layout Engine. These are declared once
 * here — not duplicated per component — because Box, Container, Flex, Grid,
 * Stack, and Layout all need the same "size/spacing/background/border/
 * radius/shadow/position/transform/animation" vocabulary. Component-specific
 * groups (Flex's `justify`/`align`, Grid's `templateColumns`, Stack's
 * `divider`) stay local to that component's own config file.
 */

/**
 * Any sizing/spacing value can be a single value, OR an object keyed by
 * breakpoint — resolved at render time by core/responsive/useResponsiveValue.
 * A plain value is equivalent to setting it for every breakpoint.
 */
export type ResponsiveValue<T> = T | Partial<Record<"mobile" | "tablet" | "laptop" | "desktop", T>>;

export type SpacingUnit = number | string; // px number, or any valid CSS length string ("2rem", "5%")

export interface SizeConfig {
  width?: ResponsiveValue<SpacingUnit>;
  height?: ResponsiveValue<SpacingUnit>;
  minWidth?: ResponsiveValue<SpacingUnit>;
  minHeight?: ResponsiveValue<SpacingUnit>;
  maxWidth?: ResponsiveValue<SpacingUnit>;
  maxHeight?: ResponsiveValue<SpacingUnit>;
  aspectRatio?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
  fullScreen?: boolean;
}

export interface SpacingConfig {
  padding?: ResponsiveValue<SpacingUnit>;
  paddingX?: ResponsiveValue<SpacingUnit>;
  paddingY?: ResponsiveValue<SpacingUnit>;
  margin?: ResponsiveValue<SpacingUnit>;
  marginX?: ResponsiveValue<SpacingUnit>;
  marginY?: ResponsiveValue<SpacingUnit>;
  gap?: ResponsiveValue<SpacingUnit>;
}

export interface BorderConfig {
  width?: number;
  style?: "solid" | "dashed" | "dotted" | "none";
  color?: string;
}

/** A single value rounds every corner; the object allows independent corners. */
export type RadiusConfig =
  | number
  | {
      topLeft?: number;
      topRight?: number;
      bottomRight?: number;
      bottomLeft?: number;
    };

export interface ShadowConfig {
  /** A named elevation step, or a raw CSS box-shadow value via `custom`. */
  elevation?: "none" | "sm" | "md" | "lg" | "xl";
  custom?: string;
}

export interface BackgroundConfig {
  color?: string;
  gradient?: string;
  image?: string;
  video?: string;
  /** Applies a glass (translucent + blurred) treatment on top of `color`. */
  glass?: boolean;
  /** 0-1. */
  glassOpacity?: number;
  blur?: number;
  /** Renders a semi-transparent overlay above a background image/video (useful for text legibility). */
  overlay?: string;
}

export interface PositionConfig {
  type?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: SpacingUnit;
  right?: SpacingUnit;
  bottom?: SpacingUnit;
  left?: SpacingUnit;
  zIndex?: number;
}

export interface TransformConfig {
  translateX?: SpacingUnit;
  translateY?: SpacingUnit;
  rotate?: number;
  scale?: number;
}

/** Partial style overrides applied on hover/focus/active — merged onto the base style, not a full replacement. */
export interface InteractionStateConfig {
  background?: string;
  color?: string;
  borderColor?: string;
  transform?: TransformConfig;
  opacity?: number;
  shadow?: ShadowConfig;
}

export interface BoxStyleConfig {
  size?: SizeConfig;
  spacing?: SpacingConfig;
  border?: BorderConfig;
  radius?: RadiusConfig;
  shadow?: ShadowConfig;
  background?: BackgroundConfig;
  position?: PositionConfig;
  transform?: TransformConfig;
  opacity?: number;
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  cursor?: string;
  hover?: InteractionStateConfig;
  focus?: InteractionStateConfig;
  active?: InteractionStateConfig;
  animation?: {
    enabled?: boolean;
    preset?: "slide" | "fade" | "scale" | "blur" | "spring";
    duration?: number;
    delay?: number;
    easing?: "easeOut" | "easeIn" | "easeInOut" | "linear";
  };
}

/** Props every Box-based component accepts for polymorphic rendering and children. */
export interface PolymorphicProps {
  as?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
