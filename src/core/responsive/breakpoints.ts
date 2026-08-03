import { useMediaQuery } from "../../shared/hooks/useMediaQuery";

/**
 * core/responsive/breakpoints.ts
 *
 * The four breakpoints every Layout Engine component's responsive values
 * are keyed by. Widths are min-widths (mobile-first): a component is
 * considered "tablet" once the viewport is >= TABLET px, and so on.
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  laptop: 1024,
  desktop: 1440,
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

export const BREAKPOINT_ORDER: BreakpointName[] = ["mobile", "tablet", "laptop", "desktop"];

/**
 * Returns the current breakpoint name based on viewport width. SSR-safe:
 * every underlying media query defaults to `false` until mounted in the
 * browser (see shared/hooks/useMediaQuery.ts), so this resolves to
 * "mobile" on the very first render and corrects itself on mount — the
 * safer default for responsive layout (mobile-first) than assuming a large
 * viewport that may not exist.
 */
export function useCurrentBreakpoint(): BreakpointName {
  const isTabletUp = useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`);
  const isLaptopUp = useMediaQuery(`(min-width: ${BREAKPOINTS.laptop}px)`);
  const isDesktopUp = useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);

  if (isDesktopUp) return "desktop";
  if (isLaptopUp) return "laptop";
  if (isTabletUp) return "tablet";
  return "mobile";
}
