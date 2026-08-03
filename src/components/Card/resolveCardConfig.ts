import { defaultCardConfig, cardPresets } from './card.config';
import type { CardConfig, PartialCardConfig } from './Card.types';

/* ============================================================================
 * DEEP MERGE UTILITY
 *
 * - Never mutates either input.
 * - Plain objects are merged key by key (recursively).
 * - Arrays, class instances, React elements, functions, and other
 *   non-plain-object values are replaced wholesale by the source value
 *   (arrays intentionally do not concatenate — e.g. hover.effects should
 *   fully override, not append).
 * ==========================================================================*/

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  if (Array.isArray(value)) return false;
  // Exclude React elements (`$$typeof`), DOM nodes, and other non-POJOs.
  if ('$$typeof' in (value as Record<string, unknown>)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined) return base;

  if (!isPlainObject(base) || !isPlainObject(override)) {
    // Primitive, array, function, or React node — override wins outright.
    return override as T;
  }

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };

  for (const key of Object.keys(override)) {
    const overrideValue = (override as Record<string, unknown>)[key];
    const baseValue = (base as Record<string, unknown>)[key];

    if (overrideValue === undefined) continue;

    result[key] = isPlainObject(baseValue) && isPlainObject(overrideValue)
      ? deepMerge(baseValue, overrideValue)
      : overrideValue;
  }

  return result as T;
}

/* ============================================================================
 * RESOLUTION PIPELINE
 *
 *   defaultCardConfig  →  preset config (if any)  →  user config
 *
 * Later layers win on a per-field basis; nothing earlier is mutated.
 * ==========================================================================*/

export function resolveCardConfig(userConfig: PartialCardConfig = {}): CardConfig {
  const presetName = userConfig.preset ?? defaultCardConfig.preset;
  const preset = presetName && presetName in cardPresets
    ? cardPresets[presetName as keyof typeof cardPresets]
    : undefined;

  let resolved: CardConfig = deepMerge(defaultCardConfig, {});
  if (preset) {
    resolved = deepMerge(resolved, preset);
  }
  resolved = deepMerge(resolved, userConfig);

  return resolved;
}

/**
 * Registers (or overrides) a named preset at runtime without mutating the
 * built-in preset table. Returns a new lookup map — callers who want a
 * custom preset available to <Card config={{ preset: 'myPreset' }} />
 * should merge it into their own copy of cardPresets before rendering, e.g.:
 *
 *   const myPresets = withCustomPreset('myPreset', { appearance: { variant: 'glass' } });
 */
export function withCustomPreset(
  name: string,
  config: PartialCardConfig,
): Record<string, PartialCardConfig> {
  return { ...cardPresets, [name]: config };
}
