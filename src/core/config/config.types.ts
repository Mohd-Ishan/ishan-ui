import type * as React from "react";

/**
 * core/config/config.types.ts
 *
 * Library-wide config primitives. Every component's `<name>.config.ts` builds on top
 * of these two types. Kept intentionally minimal so it never conflicts with a
 * component's own, more specific config groups.
 */

/** Makes every property (including nested objects) optional, recursively. */
export type DeepPartial<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

/**
 * Base shape every component config may extend. Deliberately minimal —
 * component-specific config (theme variants, animation timings, a11y flags, etc.)
 * lives in that component's own config file, not here, so this never has to be
 * renegotiated as the library grows.
 */
export interface BaseComponentConfig {
  /** Escape hatch: merged onto the component's outermost element. */
  className?: string;
  /** Escape hatch: merged onto the component's outermost element. */
  style?: React.CSSProperties;
}

/** A function that resolves a full config from an optional partial override. */
export type ConfigResolver<T> = (overrides?: DeepPartial<T>) => T;
