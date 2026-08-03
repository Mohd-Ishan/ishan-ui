import { motion } from "framer-motion";
import styles from "../Navbar.module.css";
import { NAVBAR_ARIA_LABELS, NAVBAR_IDS } from "../navbar.constants";

export interface NavbarMobileToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  shouldAnimate: boolean;
}

/**
 * parts/NavbarMobileToggle.tsx
 *
 * Three-line hamburger that morphs into an X. Purely CSS-transform driven
 * (no icon library dependency) so it stays crisp at any size and adds zero
 * bytes beyond this component.
 */
export function NavbarMobileToggle({ isOpen, onToggle, shouldAnimate }: NavbarMobileToggleProps) {
  const transition = { duration: shouldAnimate ? 0.25 : 0, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <button
      type="button"
      className={styles.mobileToggle}
      aria-expanded={isOpen}
      aria-controls={NAVBAR_IDS.mobileMenu}
      aria-label={isOpen ? NAVBAR_ARIA_LABELS.mobileToggleClose : NAVBAR_ARIA_LABELS.mobileToggleOpen}
      onClick={onToggle}
    >
      <motion.span
        className={styles.hamburgerLine}
        animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={transition}
      />
      <motion.span
        className={styles.hamburgerLine}
        animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
        transition={transition}
      />
      <motion.span
        className={styles.hamburgerLine}
        animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={transition}
      />
    </button>
  );
}
