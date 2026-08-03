import type { DeepPartial } from "./config.types";

/**
 * core/config/defineConfig.ts
 *
 * `core/` must never depend on `components/` (Dependency Inversion — see
 * docs/architecture/decisions/0001-config-driven-components.md and the
 * module-boundary rules in the Phase 1 architecture doc). This file therefore
 * only provides the generic, component-agnostic machinery for building typed
 * config-authoring helpers. The concrete `defineConfig.navbar` (and future
 * `.button`, `.modal`, etc.) entries are assembled in `src/index.ts` — the one
 * file the architecture explicitly permits to import from multiple
 * `components/*` folders — and attached onto the object exported from here.
 */

/** Builds a typed, identity-at-runtime config-authoring helper for one component's config type. */
export function createDefineConfigEntry<T>() {
  return (config: DeepPartial<T>): DeepPartial<T> => config;
}

/**
 * The base object every component's `defineConfig.<name>` entry is attached
 * to. Deliberately untyped/empty here — `src/index.ts` re-exports an
 * `Object.assign`'d, fully-typed version of this same object.
 */
export const defineConfig: Record<string, (config: never) => unknown> = {};
