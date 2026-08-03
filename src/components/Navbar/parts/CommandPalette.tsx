import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createFocusTrap } from "../../../core/a11y/focusTrap";
import { createPresetVariants } from "../../../core/motion/presets";
import { useLockBodyScroll } from "../../../shared/hooks/useLockBodyScroll";
import styles from "../Navbar.module.css";
import type { CommandPaletteMatch } from "../commandPalette.utils";
import type { NavbarConfig } from "../navbar.config";
import type { CommandPaletteState } from "../hooks/useCommandPalette";

export interface CommandPaletteProps {
  state: CommandPaletteState;
  placeholder: string;
  animation: NavbarConfig["animation"];
  shouldAnimate: boolean;
}

/** Wraps the matched substring of a label in <mark> for visual highlighting; falls back to plain text for keyword-only matches. */
function HighlightedLabel({ item }: { item: CommandPaletteMatch }) {
  if (item.matchStart < 0) return <>{item.label}</>;

  return (
    <>
      {item.label.slice(0, item.matchStart)}
      <mark className={styles.commandPaletteHighlight}>
        {item.label.slice(item.matchStart, item.matchEnd)}
      </mark>
      {item.label.slice(item.matchEnd)}
    </>
  );
}

/**
 * parts/CommandPalette.tsx
 *
 * Feature 2. Rendered unconditionally by Navbar.tsx; AnimatePresence handles
 * mount/unmount. Reuses the same focus-trap primitive (core/a11y) and
 * body-scroll-lock hook (shared/hooks) as MobileMenu — no new a11y or
 * scroll-lock logic invented for this feature.
 */
export function CommandPalette({ state, placeholder, animation, shouldAnimate }: CommandPaletteProps) {
  const { isOpen, query, setQuery, results, selectedIndex, selectIndex, moveSelection, close } = state;
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSelection(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSelection(-1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        selectIndex(selectedIndex);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    inputRef.current?.focus();

    let releaseFocusTrap: (() => void) | undefined;
    if (panelRef.current) {
      releaseFocusTrap = createFocusTrap(panelRef.current);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      releaseFocusTrap?.();
    };
  }, [isOpen, close, moveSelection, selectIndex, selectedIndex]);

  // Keep the highlighted result scrolled into view as arrow keys move it.
  useEffect(() => {
    if (!isOpen) return;
    const activeOption = listRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
    if (typeof activeOption?.scrollIntoView === "function") {
      activeOption.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, selectedIndex]);

  const preset = animation.preset ?? "scale";
  const variants = createPresetVariants(preset, {
    duration: (shouldAnimate ? animation.duration : 0) * 0.5,
    delay: 0,
    easing: animation.easing,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.mobileBackdrop}
            initial={shouldAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={shouldAnimate ? { opacity: 0 } : undefined}
            transition={{ duration: shouldAnimate ? animation.duration * 0.4 : 0 }}
            onClick={close}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className={styles.commandPalette}
            variants={variants}
            initial={shouldAnimate ? "hidden" : false}
            animate="visible"
            exit={shouldAnimate ? "exit" : undefined}
          >
            <div className={styles.commandPaletteInputRow}>
              <svg
                className={styles.commandPaletteSearchIcon}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls="ishan-ui-command-palette-list"
                aria-activedescendant={
                  results[selectedIndex] ? `ishan-ui-command-option-${selectedIndex}` : undefined
                }
                autoComplete="off"
                spellCheck={false}
                className={styles.commandPaletteInput}
                placeholder={placeholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <kbd className={styles.commandPaletteEscHint}>Esc</kbd>
            </div>

            <div
              ref={listRef}
              id="ishan-ui-command-palette-list"
              role="listbox"
              aria-label="Search results"
              className={styles.commandPaletteList}
            >
              {results.length === 0 && <div className={styles.commandPaletteEmpty}>No results</div>}

              {results.map((item, index) => (
                <button
                  key={item.id}
                  id={`ishan-ui-command-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === selectedIndex}
                  data-selected={index === selectedIndex}
                  className={styles.commandPaletteItem}
                  onMouseEnter={() => state.setSelectedIndex(index)}
                  onClick={() => selectIndex(index)}
                >
                  <span className={styles.commandPaletteItemGroup}>{item.group}</span>
                  <span className={styles.commandPaletteItemLabel}>
                    <HighlightedLabel item={item} />
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
