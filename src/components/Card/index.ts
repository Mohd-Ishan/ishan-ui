export { Card, default } from './Card';
export { resolveCardConfig, deepMerge, withCustomPreset } from './resolveCardConfig';
export { defaultCardConfig, cardPresets } from './card.config';

export type {
  CardConfig,
  PartialCardConfig,
  CardProps,
  CardMediaProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardBadgeProps,
  CardActionsProps,
  CardPresetName,
  AppearanceConfig,
  AppearanceVariant,
  LayoutConfig,
  LayoutDirection,
  MediaConfig,
  MediaType,
  MediaPosition,
  MediaFit,
  HeaderConfig,
  BodyConfig,
  FooterConfig,
  BadgeConfig,
  BadgePosition,
  ActionsConfig,
  BackgroundConfig,
  BackgroundKind,
  BackgroundOverlayConfig,
  BorderConfig,
  BorderSideConfig,
  RadiusConfig,
  RadiusToken,
  ShadowConfig,
  ShadowToken,
  HoverConfig,
  HoverEffect,
  InteractionConfig,
  AnimationConfig,
  AnimationPreset,
  LoadingConfig,
  ResponsiveConfig,
  Breakpoint,
  Responsive,
  TypographyConfig,
  TypographyStyle,
  ThemeConfig,
  ThemeMode,
  AccessibilityConfig,
  Size,
  Alignment,
} from './Card.types';

/**
 * Convenience helper for authoring a config with type inference, mirroring
 * the `defineConfig.card({...})` ergonomics from the design brief.
 *
 * Usage:
 *   const cardConfig = defineConfig.card({ appearance: { variant: 'glass' } });
 */
import type { PartialCardConfig } from './Card.types';

export const defineConfig = {
  card: (config: PartialCardConfig): PartialCardConfig => config,
};
