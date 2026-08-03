import { useEffect, useRef, useState } from "react";

/**
 * hooks/useScrollAppearance.ts
 *
 * Feature 1: Scroll Appearance Transition. Purely a boolean "have we passed
 * the trigger point" signal — Navbar.tsx maps that to `from`/`to` and lets
 * the existing CSS transition (already present on .container for
 * background-color/border-color/box-shadow/backdrop-filter) animate the
 * switch. No new animation mechanism, no duplicated scroll-tracking logic:
 * this is deliberately a sibling to useScrollDirection (hide-on-scroll)
 * rather than a merge into it, since they answer different questions
 * (direction vs. absolute position) and Feature 1 must keep working whether
 * or not hide-on-scroll is also enabled.
 */
export function useScrollAppearance(enabled: boolean, trigger: number): boolean {
  const [isPastTrigger, setIsPastTrigger] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    function evaluate() {
      const next = window.scrollY >= trigger;
      setIsPastTrigger((prev) => (prev === next ? prev : next));
    }

    function handleScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        evaluate();
        ticking.current = false;
      });
    }

    // Correct for a page that loads already scrolled (e.g. anchor navigation).
    evaluate();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, trigger]);

  return enabled ? isPastTrigger : false;
}
