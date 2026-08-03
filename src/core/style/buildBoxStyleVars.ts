import type { CSSProperties } from "react";
import type {
  BoxStyleConfig,
  InteractionStateConfig,
  RadiusConfig,
  ShadowConfig,
  SpacingUnit,
  TransformConfig,
} from "./tokens";

/**
 * core/style/buildBoxStyleVars.ts
 *
 * The Layout Engine's one shared style-to-CSS-vars engine. Box calls this
 * directly; Container/Flex/Grid/Stack/Layout call it too (each after
 * layering their own component-specific config on top) since they're all
 * built on Box. This is what "everything visual should eventually be built
 * using Box" means in practice: one implementation of "how does a shadow
 * elevation/radius object/background config become CSS", used everywhere.
 *
 * Callers are responsible for resolving any `ResponsiveValue<T>` fields to
 * plain values first (see core/responsive/useResponsiveValue.ts) — this
 * function only deals in final, breakpoint-resolved values.
 */

const ELEVATION_SHADOW: Record<NonNullable<ShadowConfig["elevation"]>, string> = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.08)",
  md: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
  lg: "0 12px 32px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.08)",
  xl: "0 24px 64px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.1)",
};

function toCssLength(value: SpacingUnit | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function resolveShadow(shadow: ShadowConfig | undefined): string | undefined {
  if (!shadow) return undefined;
  if (shadow.custom) return shadow.custom;
  if (shadow.elevation) return ELEVATION_SHADOW[shadow.elevation];
  return undefined;
}

function resolveRadius(radius: RadiusConfig | undefined): string | undefined {
  if (radius === undefined) return undefined;
  if (typeof radius === "number") return `${radius}px`;
  const { topLeft = 0, topRight = 0, bottomRight = 0, bottomLeft = 0 } = radius;
  return `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`;
}

function resolveTransform(transform: TransformConfig | undefined): string | undefined {
  if (!transform) return undefined;
  const parts: string[] = [];
  if (transform.translateX !== undefined || transform.translateY !== undefined) {
    parts.push(
      `translate(${toCssLength(transform.translateX) ?? "0px"}, ${toCssLength(transform.translateY) ?? "0px"})`,
    );
  }
  if (transform.rotate !== undefined) parts.push(`rotate(${transform.rotate}deg)`);
  if (transform.scale !== undefined) parts.push(`scale(${transform.scale})`);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

function resolveBackground(background: BoxStyleConfig["background"]): string | undefined {
  if (!background) return undefined;
  if (background.glass) {
    const opacity = background.glassOpacity ?? 0.7;
    return background.color ? withAlpha(background.color, opacity) : `rgba(255, 255, 255, ${opacity})`;
  }
  if (background.gradient) return background.gradient;
  if (background.color) return background.color;
  return undefined;
}

/** Best-effort: if `color` is already an rgba()/hex, blends in the requested alpha via color-mix; otherwise returns it unchanged. */
function withAlpha(color: string, opacity: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`;
}

function buildInteractionVars(prefix: string, state: InteractionStateConfig | undefined): Record<string, string> {
  if (!state) return {};
  const vars: Record<string, string> = {};
  if (state.background) vars[`--ishan-box-${prefix}-bg`] = state.background;
  if (state.color) vars[`--ishan-box-${prefix}-color`] = state.color;
  if (state.borderColor) vars[`--ishan-box-${prefix}-border-color`] = state.borderColor;
  if (state.opacity !== undefined) vars[`--ishan-box-${prefix}-opacity`] = String(state.opacity);
  const transform = resolveTransform(state.transform);
  if (transform) vars[`--ishan-box-${prefix}-transform`] = transform;
  const shadow = resolveShadow(state.shadow);
  if (shadow) vars[`--ishan-box-${prefix}-shadow`] = shadow;
  return vars;
}

export function buildBoxStyleVars(config: BoxStyleConfig): CSSProperties {
  const vars: Record<string, string> = {};

  const size = config.size;
  if (size) {
    if (size.fullWidth) vars["--ishan-box-width"] = "100%";
    else if (size.width !== undefined) vars["--ishan-box-width"] = toCssLength(size.width as SpacingUnit)!;
    if (size.fullHeight) vars["--ishan-box-height"] = "100%";
    else if (size.height !== undefined) vars["--ishan-box-height"] = toCssLength(size.height as SpacingUnit)!;
    if (size.fullScreen) vars["--ishan-box-min-height"] = "100vh";
    else if (size.minHeight !== undefined)
      vars["--ishan-box-min-height"] = toCssLength(size.minHeight as SpacingUnit)!;
    if (size.minWidth !== undefined) vars["--ishan-box-min-width"] = toCssLength(size.minWidth as SpacingUnit)!;
    if (size.maxWidth !== undefined) vars["--ishan-box-max-width"] = toCssLength(size.maxWidth as SpacingUnit)!;
    if (size.maxHeight !== undefined) vars["--ishan-box-max-height"] = toCssLength(size.maxHeight as SpacingUnit)!;
    if (size.aspectRatio) vars["--ishan-box-aspect-ratio"] = size.aspectRatio;
  }

  const spacing = config.spacing;
  if (spacing) {
    if (spacing.padding !== undefined) vars["--ishan-box-padding"] = toCssLength(spacing.padding as SpacingUnit)!;
    if (spacing.paddingX !== undefined)
      vars["--ishan-box-padding-x"] = toCssLength(spacing.paddingX as SpacingUnit)!;
    if (spacing.paddingY !== undefined)
      vars["--ishan-box-padding-y"] = toCssLength(spacing.paddingY as SpacingUnit)!;
    if (spacing.margin !== undefined) vars["--ishan-box-margin"] = toCssLength(spacing.margin as SpacingUnit)!;
    if (spacing.marginX !== undefined) vars["--ishan-box-margin-x"] = toCssLength(spacing.marginX as SpacingUnit)!;
    if (spacing.marginY !== undefined) vars["--ishan-box-margin-y"] = toCssLength(spacing.marginY as SpacingUnit)!;
    if (spacing.gap !== undefined) vars["--ishan-box-gap"] = toCssLength(spacing.gap as SpacingUnit)!;
  }

  if (config.border) {
    const { width, style: borderStyle, color } = config.border;
    // If style/color is set without an explicit width, default to 1px —
    // otherwise the border is invisible (width falls back to 0px) despite
    // the consumer clearly configuring a border.
    const resolvedWidth = width !== undefined ? width : borderStyle || color ? 1 : undefined;
    if (resolvedWidth !== undefined) vars["--ishan-box-border-width"] = `${resolvedWidth}px`;
    if (borderStyle) vars["--ishan-box-border-style"] = borderStyle;
    if (color) vars["--ishan-box-border-color"] = color;
  }

  const radius = resolveRadius(config.radius);
  if (radius) vars["--ishan-box-radius"] = radius;

  const shadow = resolveShadow(config.shadow);
  if (shadow) vars["--ishan-box-shadow"] = shadow;

  const background = resolveBackground(config.background);
  if (background) vars["--ishan-box-bg"] = background;
  if (config.background?.image) vars["--ishan-box-bg-image"] = `url(${config.background.image})`;
  if (config.background?.overlay) vars["--ishan-box-bg-overlay"] = config.background.overlay;
  if (config.background?.blur || config.background?.glass) {
    vars["--ishan-box-backdrop-blur"] = `blur(${config.background.blur ?? 12}px)`;
  }

  const hasVideo = Boolean(config.background?.video);
  const hasOverlay = Boolean(config.background?.overlay);
  const explicitPositionType = config.position?.type;

  if (config.position) {
    const { type, top, right, bottom, left, zIndex } = config.position;
    if (type) vars["--ishan-box-position"] = type;
    if (top !== undefined) vars["--ishan-box-top"] = toCssLength(top)!;
    if (right !== undefined) vars["--ishan-box-right"] = toCssLength(right)!;
    if (bottom !== undefined) vars["--ishan-box-bottom"] = toCssLength(bottom)!;
    if (left !== undefined) vars["--ishan-box-left"] = toCssLength(left)!;
    if (zIndex !== undefined) vars["--ishan-box-z-index"] = String(zIndex);
  }

  // A background video/overlay renders as an absolutely-positioned child
  // (see Box.tsx). Without a positioning context on the Box itself, that
  // child escapes to the nearest positioned ancestor instead of filling
  // this Box, which is never the intended result. Only auto-applies when
  // the consumer hasn't explicitly chosen a position type themselves.
  if ((hasVideo || hasOverlay) && !explicitPositionType) {
    vars["--ishan-box-position"] = "relative";
  }

  const transform = resolveTransform(config.transform);
  if (transform) vars["--ishan-box-transform"] = transform;

  if (config.opacity !== undefined) vars["--ishan-box-opacity"] = String(config.opacity);
  if (config.overflow) vars["--ishan-box-overflow"] = config.overflow;
  if (config.cursor) vars["--ishan-box-cursor"] = config.cursor;

  // Hover/focus/active transitions (and, separately, an entrance animation
  // via Framer Motion) both read "how fast should this move" from the same
  // config.animation.duration — previously this was hardcoded to 0.2s in
  // Box.module.css regardless of what the consumer configured.
  if (config.animation?.duration !== undefined) {
    vars["--ishan-box-transition-duration"] = `${config.animation.duration}s`;
  }

  Object.assign(vars, buildInteractionVars("hover", config.hover));
  Object.assign(vars, buildInteractionVars("focus", config.focus));
  Object.assign(vars, buildInteractionVars("active", config.active));

  return vars as CSSProperties;
}
