import { useEffect, useRef, useState } from "react";
import { SCROLLED_THRESHOLD, SCROLL_DIRECTION_THRESHOLD } from "../navbar.constants";

export interface ScrollState {
  direction: "up" | "down" | null;
  /** True once the page has scrolled past SCROLLED_THRESHOLD — drives elevation/blur states. */
  isScrolled: boolean;
}

/**
 * hooks/useScrollDirection.ts
 *
 * Tracks scroll direction with a small threshold to avoid flip-flopping on
 * sub-pixel scroll jitter (trackpads, momentum scrolling). Passive listener,
 * rAF-throttled so it never contends with the browser's own scroll handling.
 */
export function useScrollDirection(enabled: boolean): ScrollState {
  const [state, setState] = useState<ScrollState>({ direction: null, isScrolled: false });
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    lastScrollY.current = window.scrollY;

    function handleScroll(): void {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        setState((previous) => {
          const isScrolled = currentY > SCROLLED_THRESHOLD;

          if (Math.abs(delta) < SCROLL_DIRECTION_THRESHOLD) {
            return previous.isScrolled === isScrolled ? previous : { ...previous, isScrolled };
          }

          const direction = delta > 0 ? "down" : "up";
          lastScrollY.current = currentY;

          if (previous.direction === direction && previous.isScrolled === isScrolled) {
            return previous;
          }

          return { direction, isScrolled };
        });

        ticking.current = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled]);

  return state;
}
