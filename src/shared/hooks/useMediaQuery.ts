import { useEffect, useState } from "react";

/**
 * shared/hooks/useMediaQuery.ts
 *
 * Subscribes to a CSS media query string and returns whether it currently
 * matches. SSR-safe: returns `false` until mounted in the browser. Also safe
 * in jsdom-based test environments that don't polyfill `matchMedia` — jsdom
 * defines the property but its stub throws when called, so this checks that
 * it's an actual function rather than just present.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

/** Convenience wrapper: is the viewport at or below `breakpointPx` wide? */
export function useIsBelowBreakpoint(breakpointPx: number): boolean {
  return useMediaQuery(`(max-width: ${breakpointPx - 1}px)`);
}
