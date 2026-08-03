/**
 * core/a11y/focusTrap.ts
 *
 * Framework-agnostic focus trap. Given a container, keeps Tab/Shift+Tab
 * cycling within its focusable descendants. Used by any component that
 * renders a modal-like overlay (mobile menu, profile dropdown, and future
 * Modal/Drawer/Dropdown components).
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * Attaches a keydown listener that traps Tab focus within `container`.
 * Returns a cleanup function to remove the listener.
 */
export function createFocusTrap(container: HTMLElement): () => void {
  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Tab") return;

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener("keydown", handleKeyDown);
  return () => container.removeEventListener("keydown", handleKeyDown);
}

/** Focuses the first focusable element within `container`, if any. */
export function focusFirstElement(container: HTMLElement): void {
  const [first] = getFocusableElements(container);
  first?.focus();
}
