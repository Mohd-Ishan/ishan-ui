import { useMediaQuery } from "./useMediaQuery";

/**
 * shared/hooks/usePrefersReducedMotion.ts
 *
 * Reads the OS/browser-level `prefers-reduced-motion` setting. Components
 * combine this with their own `accessibility.reduceMotion` config
 * ("auto" | "always" | "never") to decide whether to run Framer Motion
 * animations at all.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
