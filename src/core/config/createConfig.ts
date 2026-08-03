import { deepMerge } from "../../shared/utils/deepMerge";
import type { ConfigResolver, DeepPartial } from "./config.types";

/**
 * core/config/createConfig.ts
 *
 * Component-agnostic config factory. Every component's `resolve<Name>Config`
 * export is `createConfig(defaults)`, guaranteeing identical merge semantics
 * (deep merge, array replacement, undefined-skips-key) across the whole library.
 *
 * The explicit `ConfigResolver<T>` return annotation matters beyond style:
 * without it, TypeScript's declaration-emit has no named type to reference
 * for the resolver's parameter and structurally re-expands the entire
 * (recursive, DeepPartial'd) shape of T inline in the rolled-up .d.ts —
 * which, for a config containing plain `string`/`number` leaves, drags in
 * the full lib.dom/csstype structural surface those primitives structurally
 * match against. Annotating the return type keeps `T` a nominal reference.
 */
export function createConfig<T extends object>(defaults: T): ConfigResolver<T> {
  return function resolveConfig(overrides?: DeepPartial<T>): T {
    return deepMerge(defaults, overrides as Partial<T> | undefined);
  };
}

/** A resolver that also accepts an optional named preset, merged between defaults and user overrides. */
export type PresetAwareConfigResolver<T> = (
  overrides?: DeepPartial<T>,
  presetName?: string,
) => T;

/**
 * Layout Engine components (Box, Container, Flex, Grid, Stack, Layout) need
 * a three-way merge — defaults, then an optional named preset, then the
 * user's own overrides — rather than the plain two-way merge every other
 * component uses. This is a genuinely different (superset) resolution
 * strategy, so it's a separate function rather than a parameter added to
 * `createConfig` — existing `resolve<Name>Config` calls throughout the
 * library (Navbar, Button) are completely unaffected by this addition.
 */
export function createConfigWithPresets<T extends object>(
  defaults: T,
  presets: Record<string, DeepPartial<T>>,
): PresetAwareConfigResolver<T> {
  return function resolveConfig(overrides?: DeepPartial<T>, presetName?: string): T {
    const presetLayer = presetName ? presets[presetName] : undefined;
    const withPreset = presetLayer ? deepMerge(defaults, presetLayer as Partial<T>) : defaults;
    return deepMerge(withPreset, overrides as Partial<T> | undefined);
  };
}
