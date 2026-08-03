import { useCallback, useRef, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPresetVariants, type AnimationPresetName } from "../../../core/motion/presets";
import { useDropdown } from "../hooks/useDropdown";
import styles from "../Navbar.module.css";
import { NAVBAR_IDS } from "../navbar.constants";
import type { NavItemConfig } from "../navbar.config";

export interface NavbarDropdownProps {
  item: NavItemConfig;
  isActive: (path: string) => boolean;
  onNavigate: (path: string) => void;
  smoothScrollOffset: number;
  shouldAnimate: boolean;
  preset: AnimationPresetName;
  duration: number;
  delay: number;
  easing: "easeOut" | "easeIn" | "easeInOut" | "linear";
}

function scrollToHash(hash: string, offset: number): void {
  const target = document.getElementById(hash.replace("#", ""));
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

/**
 * parts/NavbarDropdown.tsx
 *
 * Desktop-only. Renders a trigger (the parent NavItemConfig) plus a panel of
 * its `dropdown` children. Hover opens/closes on desktop; the same
 * open/close mechanics (useDropdown) are reused by the mobile accordion in
 * MobileMenu.tsx so there's exactly one implementation of "outside click /
 * Escape closes".
 */
export function NavbarDropdown({
  item,
  isActive,
  onNavigate,
  smoothScrollOffset,
  shouldAnimate,
  preset,
  duration,
  delay,
  easing,
}: NavbarDropdownProps) {
  const dropdown = useDropdown({ closeOnOutsideClick: true, closeOnEscape: true });
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      dropdown.containerRef.current = node;
    },
    [dropdown.containerRef],
  );

  const children = item.dropdown ?? [];
  const hasActiveChild = children.some((child) => isActive(child.path));
  const variants = createPresetVariants(preset, { duration, delay, easing });

  function handleChildClick(event: MouseEvent, path: string) {
    dropdown.close();
    if (path.startsWith("#")) {
      event.preventDefault();
      scrollToHash(path, smoothScrollOffset);
      return;
    }
    event.preventDefault();
    onNavigate(path);
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dropdown.open();
      requestAnimationFrame(() => itemRefs.current[0]?.focus());
    }
  }

  function handlePanelKeyDown(event: ReactKeyboardEvent, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = itemRefs.current[index + 1] ?? itemRefs.current[0];
      next?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index === 0) {
        triggerRef.current?.focus();
        dropdown.close();
      } else {
        itemRefs.current[index - 1]?.focus();
      }
    }
  }

  return (
    <div
      className={styles.dropdownContainer}
      ref={setContainerRef}
      onMouseEnter={dropdown.open}
      onMouseLeave={dropdown.close}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.linkAnchor}
        data-active={hasActiveChild}
        aria-haspopup="menu"
        aria-expanded={dropdown.isOpen}
        aria-controls={`${NAVBAR_IDS.mobileMenu}-dropdown-${item.id}`}
        onClick={dropdown.toggle}
        onKeyDown={handleTriggerKeyDown}
      >
        {hasActiveChild &&
          (shouldAnimate ? (
            <motion.span
              layoutId="ishan-navbar-active-indicator"
              className={styles.activeIndicator}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          ) : (
            <span className={styles.activeIndicator} />
          ))}
        {item.label}
        <svg
          className={styles.dropdownChevron}
          data-open={dropdown.isOpen}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
        >
          <path d="M1.5 3.5L5 7l3.5-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      <AnimatePresence>
        {dropdown.isOpen && (
          <motion.div
            id={`${NAVBAR_IDS.mobileMenu}-dropdown-${item.id}`}
            role="menu"
            aria-label={item.label}
            className={styles.dropdownPanel}
            variants={shouldAnimate ? variants : undefined}
            initial={shouldAnimate ? "hidden" : false}
            animate="visible"
            exit={shouldAnimate ? "exit" : undefined}
          >
            {children.map((child, index) => {
              const active = isActive(child.path);
              const isExternal = child.external ?? /^https?:\/\//.test(child.path);

              return (
                <a
                  key={child.id}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  href={child.path}
                  role="menuitem"
                  className={styles.dropdownItem}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  onClick={(event) => handleChildClick(event, child.path)}
                  onKeyDown={(event) => handlePanelKeyDown(event, index)}
                  {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {child.label}
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
