import type { MouseEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import styles from "../Navbar.module.css";
import type { NavbarConfig } from "../navbar.config";

export interface NavbarCtaProps {
  cta: NavbarConfig["cta"];
  onNavigate: (path: string) => void;
  shouldAnimate: boolean;
  /** Custom content from `<Navbar.Cta>`, overriding `cta.label` while keeping config-driven styling/href. */
  children?: ReactNode;
}

/**
 * parts/NavbarCta.tsx
 *
 * The one interactive element in Navbar that's expected to draw the eye, so
 * it gets a dedicated hover micro-interaction (subtle lift + shadow bloom)
 * rather than reusing the link hover treatment.
 */
export function NavbarCta({ cta, onNavigate, shouldAnimate, children }: NavbarCtaProps) {
  if (!cta.enabled) return null;

  const isExternal = /^https?:\/\//.test(cta.href);

  function handleClick(event: MouseEvent) {
    cta.onClick?.();
    if (isExternal || cta.href.startsWith("#")) return;
    event.preventDefault();
    onNavigate(cta.href);
  }

  const content = children ?? cta.label;

  if (!shouldAnimate) {
    return (
      <a
        href={cta.href}
        className={styles.cta}
        data-variant={cta.variant}
        onClick={handleClick}
        {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <motion.a
      href={cta.href}
      className={styles.cta}
      data-variant={cta.variant}
      onClick={handleClick}
      whileHover={{ scale: 1.035, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {content}
    </motion.a>
  );
}
