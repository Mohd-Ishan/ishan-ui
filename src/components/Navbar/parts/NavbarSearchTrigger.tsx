import styles from "../Navbar.module.css";

export interface NavbarSearchTriggerProps {
  onOpen: () => void;
  shortcut: string;
}

/** Renders "Ctrl+K" as a compact "⌘K"/"Ctrl K" badge depending on platform. */
function formatShortcutHint(shortcut: string): string {
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent);
  const key = (shortcut.split("+").pop() ?? "K").trim().toUpperCase();
  return isMac ? `⌘${key}` : `Ctrl ${key}`;
}

/**
 * parts/NavbarSearchTrigger.tsx
 *
 * Auto-rendered whenever `commandPalette.enabled` is true — the "optional
 * trigger button" from the Feature 2 spec. Purely a convenience; the
 * keyboard shortcut works globally regardless of whether this is clicked.
 */
export function NavbarSearchTrigger({ onOpen, shortcut }: NavbarSearchTriggerProps) {
  return (
    <button
      type="button"
      className={styles.searchTrigger}
      onClick={onOpen}
      aria-label="Open command palette"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className={styles.searchTriggerHint}>{formatShortcutHint(shortcut)}</span>
    </button>
  );
}
