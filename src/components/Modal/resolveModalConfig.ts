/**
 * resolveModalConfig.ts
 *
 * Everything that turns "layered config" into "things the DOM/CSS
 * can consume" lives here:
 *
 *   1. resolveModalConfig()      default -> preset -> user config (deep merge)
 *   2. getModalDataAttributes()  resolved config -> data-* attributes for variant CSS
 *   3. getModalStyleVars()       resolved config -> CSS custom properties
 *   4. buildResponsiveStyleSheet() responsive fields -> scoped <style> text
 *
 * None of the merge functions mutate their inputs.
 */

import type { CSSProperties } from 'react';
import { defaultModalConfig, modalPresets } from './modal.config';
import type {
  Breakpoint,
  ModalConfig,
  ModalConfigInput,
  Responsive,
} from './Modal.types';

// ---------------------------------------------------------------------------
// 1. Deep merge
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/** Deeply merges `source` on top of `target`, returning a brand-new object. Never mutates either input. */
function deepMerge<T>(target: T, source: unknown): T {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source === undefined ? target : ((source as unknown) as T);
  }
  const result: Record<string, unknown> = { ...(target as Record<string, unknown>) };
  for (const key of Object.keys(source)) {
    const sourceValue = (source as Record<string, unknown>)[key];
    const targetValue = result[key];
    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue;
    }
  }
  return result as T;
}

export interface ResolveModalConfigOptions {
  /** Name of a preset to apply on top of the default config. */
  preset?: string;
  /** User-supplied overrides, applied on top of the preset. */
  config?: ModalConfigInput;
  /** Preset registry to look `preset` up in. Defaults to the built-in presets. */
  presets?: Record<string, ModalConfigInput>;
  /** Base config to start from. Defaults to defaultModalConfig. */
  base?: ModalConfig;
}

/**
 * Resolves the final config for a Modal instance by merging, in order:
 * base/default config -> named preset -> user-supplied config.
 */
export function resolveModalConfig(options: ResolveModalConfigOptions = {}): ModalConfig {
  const { preset, config, presets = modalPresets, base = defaultModalConfig } = options;

  // Clone so callers never get a reference to the shared default object.
  let resolved: ModalConfig = deepMerge(base, {});

  if (preset && presets[preset]) {
    resolved = deepMerge(resolved, presets[preset]);
  }

  if (config) {
    resolved = deepMerge(resolved, config);
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// 2. Token maps (named tokens -> concrete CSS values)
// ---------------------------------------------------------------------------

export const SIZE_WIDTH_TOKENS: Record<string, string> = {
  xs: '320px',
  sm: '420px',
  md: '560px',
  lg: '720px',
  xl: '920px',
  fullscreen: '100vw',
};

export const SIZE_HEIGHT_TOKENS: Record<string, string> = {
  fullscreen: '100vh',
};

export const RADIUS_TOKENS: Record<string, string> = {
  none: '0px',
  sm: '6px',
  md: '12px',
  lg: '20px',
  pill: '999px',
};

export const SHADOW_TOKENS: Record<string, string> = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
  md: '0 8px 16px rgba(0,0,0,0.14), 0 2px 4px rgba(0,0,0,0.08)',
  lg: '0 16px 32px rgba(0,0,0,0.18), 0 4px 8px rgba(0,0,0,0.08)',
  xl: '0 24px 64px rgba(0,0,0,0.24), 0 8px 16px rgba(0,0,0,0.1)',
};

function toCssLength(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

function pickBaseValue<T>(value: Responsive<T> | undefined): T | undefined {
  if (value === undefined) return undefined;
  if (isPlainObject(value)) {
    const record = value as Partial<Record<Breakpoint, T>>;
    return record.base ?? record.sm ?? record.md ?? record.lg ?? record.xl;
  }
  return value as T;
}

function resolveBackground(config: ModalConfig): string {
  const { background, appearance } = config;
  if (appearance === 'transparent') return 'transparent';
  if (background.image) {
    return `${background.image} ${background.color ?? ''}`.trim();
  }
  if (background.gradient) return background.gradient;
  if (background.cssVariable) return `var(${background.cssVariable})`;
  return background.color ?? '#ffffff';
}

function resolveRadius(config: ModalConfig): string {
  const { radius } = config;
  if (radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight) {
    const tl = toCssLength(radius.topLeft) ?? '0px';
    const tr = toCssLength(radius.topRight) ?? '0px';
    const br = toCssLength(radius.bottomRight) ?? '0px';
    const bl = toCssLength(radius.bottomLeft) ?? '0px';
    return `${tl} ${tr} ${br} ${bl}`;
  }
  if (radius.token === 'custom') {
    return toCssLength(pickBaseValue(radius.value)) ?? RADIUS_TOKENS.md;
  }
  return RADIUS_TOKENS[radius.token ?? 'md'] ?? RADIUS_TOKENS.md;
}

function resolveShadow(config: ModalConfig): string {
  const { shadow } = config;
  if (shadow.token === 'custom') return shadow.value ?? SHADOW_TOKENS.lg;
  return SHADOW_TOKENS[shadow.token ?? 'lg'] ?? SHADOW_TOKENS.lg;
}

function resolveWidth(config: ModalConfig): string {
  const { size } = config;
  const explicit = toCssLength(pickBaseValue(size.width));
  if (explicit) return explicit;
  if (size.preset && size.preset !== 'custom') {
    return SIZE_WIDTH_TOKENS[size.preset] ?? SIZE_WIDTH_TOKENS.md;
  }
  return SIZE_WIDTH_TOKENS.md;
}

function resolveHeight(config: ModalConfig): string | undefined {
  const { size } = config;
  const explicit = toCssLength(pickBaseValue(size.height));
  if (explicit) return explicit;
  if (size.preset && SIZE_HEIGHT_TOKENS[size.preset]) return SIZE_HEIGHT_TOKENS[size.preset];
  return undefined;
}

// ---------------------------------------------------------------------------
// 3. data-* attributes (drive variant selectors in Modal.module.css)
// ---------------------------------------------------------------------------

export interface ModalDataAttributes {
  'data-appearance': string;
  'data-position': string;
  'data-anim-type': string;
  'data-radius-token': string;
  'data-shadow-token': string;
  'data-color-scheme': string;
  'data-close-position': string;
  'data-close-size': string;
  'data-header-align': string;
  'data-footer-align': string;
  'data-footer-sticky': 'true' | 'false';
  'data-body-scrollable': 'true' | 'false';
}

export function getModalDataAttributes(config: ModalConfig): ModalDataAttributes {
  return {
    'data-appearance': config.appearance,
    'data-position': config.position,
    'data-anim-type': config.animation.type ?? 'scale',
    'data-radius-token': config.radius.token ?? 'md',
    'data-shadow-token': config.shadow.token ?? 'lg',
    'data-color-scheme': config.theme.colorScheme ?? 'light',
    'data-close-position': config.closeButton.position ?? 'top-right',
    'data-close-size': config.closeButton.size ?? 'md',
    'data-header-align': config.header.align ?? 'left',
    'data-footer-align': config.footer.align ?? 'right',
    'data-footer-sticky': config.footer.sticky ? 'true' : 'false',
    'data-body-scrollable': config.body.scrollable === false ? 'false' : 'true',
  };
}

// ---------------------------------------------------------------------------
// 4. CSS custom properties (the "base" / non-responsive value of each field)
// ---------------------------------------------------------------------------

export function getModalStyleVars(config: ModalConfig): CSSProperties {
  const border = config.border;
  const vars: Record<string, string | number | undefined> = {
    '--modal-width': resolveWidth(config),
    '--modal-height': resolveHeight(config),
    '--modal-min-width': toCssLength(pickBaseValue(config.size.minWidth)),
    '--modal-max-width': toCssLength(pickBaseValue(config.size.maxWidth)) ?? '95vw',
    '--modal-min-height': toCssLength(pickBaseValue(config.size.minHeight)),
    '--modal-max-height': toCssLength(pickBaseValue(config.size.maxHeight)) ?? '90vh',
    '--modal-bg': resolveBackground(config),
    '--modal-border-width': toCssLength(pickBaseValue(border.width)) ?? '0px',
    '--modal-border-style': border.style ?? 'solid',
    '--modal-border-color': border.color ?? 'transparent',
    '--modal-border-top-width': toCssLength(border.top?.width),
    '--modal-border-top-style': border.top?.style,
    '--modal-border-top-color': border.top?.color,
    '--modal-border-right-width': toCssLength(border.right?.width),
    '--modal-border-right-style': border.right?.style,
    '--modal-border-right-color': border.right?.color,
    '--modal-border-bottom-width': toCssLength(border.bottom?.width),
    '--modal-border-bottom-style': border.bottom?.style,
    '--modal-border-bottom-color': border.bottom?.color,
    '--modal-border-left-width': toCssLength(border.left?.width),
    '--modal-border-left-style': border.left?.style,
    '--modal-border-left-color': border.left?.color,
    '--modal-radius': resolveRadius(config),
    '--modal-shadow': resolveShadow(config),
    '--modal-overlay-color': config.overlay.color ?? '#000000',
    '--modal-overlay-opacity': config.overlay.opacity ?? 0.5,
    '--modal-overlay-blur': toCssLength(config.overlay.blur) ?? '0px',
    '--modal-overlay-gradient': config.overlay.gradient,
    '--modal-anim-duration': `${config.animation.duration ?? 200}ms`,
    '--modal-anim-easing': config.animation.easing ?? 'ease-out',
    '--modal-header-padding': toCssLength(pickBaseValue(config.header.padding)) ?? '20px 24px',
    '--modal-body-padding': toCssLength(pickBaseValue(config.body.padding)) ?? '20px 24px',
    '--modal-body-spacing': toCssLength(pickBaseValue(config.body.spacing)) ?? '12px',
    '--modal-body-max-height': toCssLength(pickBaseValue(config.body.maxHeight)),
    '--modal-footer-padding': toCssLength(pickBaseValue(config.footer.padding)) ?? '16px 24px',
    '--modal-text-color': config.theme.textColor ?? '#111827',
    '--modal-muted-color': config.theme.mutedTextColor ?? '#6b7280',
    '--modal-accent-color': config.theme.accentColor ?? '#6366f1',
  };

  // Strip undefined entries so CSS falls back to Modal.module.css defaults.
  const clean: Record<string, string | number> = {};
  Object.keys(vars).forEach((key) => {
    const value = vars[key];
    if (value !== undefined && value !== '') clean[key] = value;
  });

  return clean as CSSProperties;
}

// ---------------------------------------------------------------------------
// 5. Responsive overrides -> scoped <style> text
// ---------------------------------------------------------------------------

const DEFAULT_BREAKPOINTS: Record<Breakpoint, number> = {
  base: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export interface ResponsiveFieldMap {
  [cssVarName: string]: Responsive<string | number> | undefined;
}

/**
 * Builds a scoped CSS string of `@media` blocks for any field that has
 * per-breakpoint values, targeting `.selector`. Fields that are plain
 * (non-responsive) values are ignored here since they're already set
 * as inline base CSS variables by getModalStyleVars.
 */
export function buildResponsiveStyleSheet(
  selector: string,
  fields: ResponsiveFieldMap,
  breakpoints: Partial<Record<Breakpoint, number>> = {},
): string {
  const mergedBreakpoints = { ...DEFAULT_BREAKPOINTS, ...breakpoints };
  const order: Breakpoint[] = ['sm', 'md', 'lg', 'xl'];

  const declarationsByBreakpoint: Partial<Record<Breakpoint, string[]>> = {};

  Object.entries(fields).forEach(([varName, value]) => {
    if (!isPlainObject(value)) return; // not responsive, nothing to do
    const record = value as Partial<Record<Breakpoint, string | number>>;
    order.forEach((bp) => {
      if (record[bp] === undefined) return;
      const declaration = `${varName}: ${toCssLength(record[bp])};`;
      declarationsByBreakpoint[bp] = [...(declarationsByBreakpoint[bp] ?? []), declaration];
    });
  });

  const blocks = order
    .filter((bp) => declarationsByBreakpoint[bp]?.length)
    .map((bp) => {
      const minWidth = mergedBreakpoints[bp];
      const decls = declarationsByBreakpoint[bp]!.join(' ');
      return `@media (min-width: ${minWidth}px) { ${selector} { ${decls} } }`;
    });

  return blocks.join('\n');
}
