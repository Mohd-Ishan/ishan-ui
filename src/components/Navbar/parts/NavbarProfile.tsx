import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createFocusTrap, focusFirstElement } from "../../../core/a11y/focusTrap";
import { createPresetVariants } from "../../../core/motion/presets";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import styles from "../Navbar.module.css";
import { NAVBAR_ARIA_LABELS, NAVBAR_IDS } from "../navbar.constants";
import type { NavbarConfig } from "../navbar.config";

export interface NavbarProfileProps {
  profile: NavbarConfig["profile"];
  animation: NavbarConfig["animation"];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onNavigate: (path: string) => void;
  shouldAnimate: boolean;
}

function initials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * parts/NavbarProfile.tsx
 *
 * Self-contained menu: manages its own open/close animation, outside-click,
 * Escape key, and focus trap so Navbar.tsx only needs to own the boolean
 * open state.
 */
export function NavbarProfile({
  profile,
  animation,
  isOpen,
  onToggle,
  onClose,
  onNavigate,
  shouldAnimate,
}: NavbarProfileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const variants = createPresetVariants(animation.preset ?? "scale", {
    duration: (shouldAnimate ? animation.duration : 0) * 0.4,
    delay: 0,
    easing: animation.easing,
  });

  useClickOutside(containerRef, onClose, isOpen);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    let releaseFocusTrap: (() => void) | undefined;
    if (menuRef.current) {
      focusFirstElement(menuRef.current);
      releaseFocusTrap = createFocusTrap(menuRef.current);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      releaseFocusTrap?.();
    };
  }, [isOpen, onClose]);

  if (!profile.enabled) return null;

  return (
    <div className={styles.profile} ref={containerRef}>
      <button
        type="button"
        className={styles.profileTrigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={NAVBAR_IDS.profileMenu}
        aria-label={NAVBAR_ARIA_LABELS.profileMenu}
        onClick={onToggle}
      >
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className={styles.avatar} />
        ) : (
          <span className={styles.avatarFallback}>{initials(profile.name)}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            id={NAVBAR_IDS.profileMenu}
            role="menu"
            className={styles.profileMenu}
            variants={variants}
            initial={shouldAnimate ? "hidden" : false}
            animate="visible"
            exit={shouldAnimate ? "exit" : undefined}
          >
            {(profile.name || profile.email) && (
              <div className={styles.profileMenuHeader}>
                {profile.name && <div className={styles.profileMenuName}>{profile.name}</div>}
                {profile.email && <div className={styles.profileMenuEmail}>{profile.email}</div>}
              </div>
            )}

            {profile.menuItems.map((item) => (
              <div key={item.id}>
                {item.divider && <div className={styles.profileMenuDivider} role="separator" />}
                {item.path ? (
                  <a
                    href={item.path}
                    role="menuitem"
                    className={styles.profileMenuItem}
                    onClick={(event) => {
                      event.preventDefault();
                      item.onSelect?.();
                      onNavigate(item.path!);
                    }}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.profileMenuItem}
                    onClick={() => {
                      item.onSelect?.();
                      onClose();
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}

            {profile.onLogout && (
              <>
                <div className={styles.profileMenuDivider} role="separator" />
                <button
                  type="button"
                  role="menuitem"
                  className={styles.profileMenuItem}
                  onClick={() => {
                    profile.onLogout?.();
                    onClose();
                  }}
                >
                  Log out
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
