import { useEffect } from "react";

/**
 * shared/hooks/useLockBodyScroll.ts
 *
 * Prevents the page behind an open overlay (mobile menu, modal, drawer) from
 * scrolling, and restores the previous overflow value on cleanup — including
 * when multiple overlays lock/unlock in sequence.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return;

    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}
