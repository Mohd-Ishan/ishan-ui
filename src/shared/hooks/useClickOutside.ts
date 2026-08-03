import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * shared/hooks/useClickOutside.ts
 *
 * Invokes `onOutsideClick` when a pointer event occurs outside `ref.current`.
 * `enabled` lets callers avoid attaching the listener at all when the
 * surface (menu/dropdown) is already closed — cheaper than attaching and
 * no-op-ing inside the handler.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    function handlePointerDown(event: PointerEvent): void {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        onOutsideClick();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, onOutsideClick, enabled]);
}
