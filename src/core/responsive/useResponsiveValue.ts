import { useMemo } from "react";
import type { ResponsiveValue } from "../style/tokens";
import { BREAKPOINT_ORDER, useCurrentBreakpoint, type BreakpointName } from "./breakpoints";

function isResponsiveObject<T>(value: ResponsiveValue<T>): value is Partial<Record<BreakpointName, T>> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => BREAKPOINT_ORDER.includes(key as BreakpointName))
  );
}

/**
 * core/responsive/useResponsiveValue.ts
 *
 * Resolves any Layout Engine `ResponsiveValue<T>` to a plain T for the
 * current breakpoint. Mobile-first cascade: a value defined at a smaller
 * breakpoint keeps applying at larger ones until a larger breakpoint
 * defines its own value (the standard CSS media-query mental model).
 * A plain (non-object) value passes through unchanged at every breakpoint.
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  breakpoint: BreakpointName,
): T | undefined {
  if (value === undefined) return undefined;
  if (!isResponsiveObject(value)) return value;

  const currentIndex = BREAKPOINT_ORDER.indexOf(breakpoint);
  for (let i = currentIndex; i >= 0; i--) {
    const candidate = value[BREAKPOINT_ORDER[i]];
    if (candidate !== undefined) return candidate;
  }
  return undefined;
}

export function useResponsiveValue<T>(value: ResponsiveValue<T> | undefined): T | undefined {
  const breakpoint = useCurrentBreakpoint();
  return useMemo(() => resolveResponsiveValue(value, breakpoint), [value, breakpoint]);
}
